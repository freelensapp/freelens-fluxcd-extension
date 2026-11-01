import { Renderer } from "@freelensapp/extensions";
import { load } from "js-yaml";
import { describe, expect, it } from "vitest";
import workflowSource from "../../../../.github/workflows/integration-tests.yaml?raw";
import fluxVersionsSource from "../../../../integration/fixtures/flux-versions.yaml?raw";

type KubeObjectClass = typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>;

interface FixtureSet {
  crds: string[];
  objects: string[];
}

interface FluxVersions {
  flux: Record<string, FixtureSet>;
  fluxOperator: FixtureSet;
}

interface Workflow {
  jobs: Record<string, { strategy?: { matrix?: { flux_version?: string[] } } }>;
}

interface TestObject {
  kind: string;
  apiVersion: string;
}

const fluxVersions = load(fluxVersionsSource) as FluxVersions;

// The fixture sets of the integration tests: the Flux Operator's and one per
// Flux version, each a job of the workflow matrix.
const fixtureSets = Object.entries({
  ...Object.fromEntries(Object.entries(fluxVersions.flux).map(([version, set]) => [`Flux ${version}`, set])),
  "the Flux Operator": fluxVersions.fluxOperator,
});

// Every model of the extension, one module per version of a kind, by the base
// name of its file, such as `gitrepository-v1`.
const modelModules = import.meta.glob<Record<string, unknown>>(["./*/*.ts", "!./*/*.test.ts"], { eager: true });

const modelClasses = new Map(
  Object.entries(modelModules).flatMap(([file, module]) =>
    Object.values(module)
      .filter(
        (value): value is KubeObjectClass =>
          typeof value === "function" && value.prototype instanceof Renderer.K8sApi.LensExtensionKubeObject,
      )
      .map((kubeObjectClass) => [file.replace(/^.*\/|\.ts$/g, ""), kubeObjectClass] as const),
  ),
);

// The test objects, by the name of their file, such as `gitrepository-v1.yaml`.
const objectSources = import.meta.glob<string>("../../../../integration/fixtures/objects/*.yaml", {
  query: "?raw",
  import: "default",
  eager: true,
});

const testObjects = new Map(
  Object.entries(objectSources).map(([file, source]) => [file.replace(/^.*\//, ""), load(source) as TestObject]),
);

const listedObjects = new Set(fixtureSets.flatMap(([, { objects }]) => objects));

// A model version that no Flux version of the integration tests picks is not
// tested and rots; one that no supported Flux picks any more is removed, with
// the Flux versions that picked it (#350).
describe("the Flux versions of the integration tests", () => {
  it("finds the models and the test objects", () => {
    expect(modelClasses.size).toBeGreaterThan(0);
    expect(testObjects.size).toBeGreaterThan(0);
  });

  it("are the Flux versions of the workflow matrix", () => {
    const workflow = load(workflowSource) as Workflow;

    expect(workflow.jobs["test-integration"]?.strategy?.matrix?.flux_version).toEqual(Object.keys(fluxVersions.flux));
  });

  it.each([...modelClasses])("test the model %s with an object of its version", (name, kubeObjectClass) => {
    const file = `${name}.yaml`;

    expect(listedObjects).toContain(file);
    expect(testObjects.get(file)).toMatchObject({
      kind: kubeObjectClass.kind,
      apiVersion: kubeObjectClass.crd?.apiVersions[0],
    });
  });

  it("have a model for every test object, and list every test object", () => {
    for (const file of testObjects.keys()) {
      expect(modelClasses.has(file.replace(/\.yaml$/, ""))).toBe(true);
      expect(listedObjects).toContain(file);
    }
  });

  it.each(fixtureSets)("list for %s existing objects, one per kind", (_name, { objects }) => {
    const kinds = objects.map((file) => testObjects.get(file)?.kind);

    expect(kinds).not.toContain(undefined);
    expect(new Set(kinds).size).toBe(kinds.length);
  });
});
