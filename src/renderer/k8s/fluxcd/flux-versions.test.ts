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
  resources: string[];
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

// The test objects, by the name of their file, such as `gitrepository-v1.yaml`
// or its variant for one Flux version, `gitrepository-v1.flux-v2.10.0.yaml`.
const objectSources = import.meta.glob<string>("../../../../integration/fixtures/objects/*.yaml", {
  query: "?raw",
  import: "default",
  eager: true,
});

const testObjects = new Map(
  Object.entries(objectSources).map(([file, source]) => [file.replace(/^.*\//, ""), load(source) as TestObject]),
);

// The files of the objects that the test objects refer to, such as
// `configmap-test-values.yaml`, which every Flux version applies.
const resourceFiles = Object.keys(
  import.meta.glob("../../../../integration/fixtures/resources/*.yaml", { query: "?raw", import: "default" }),
).map((file) => file.replace(/^.*\//, ""));

// The model of a test object file: the part of its name before the first `.`.
const modelOf = (file: string) => file.replace(/\..*$/, "");

// The Flux version of a variant, such as `v2.10.0`, or undefined for a file
// that is not a variant.
const fluxVersionOf = (file: string) => /^[^.]+\.flux-(.+)\.yaml$/.exec(file)?.[1];

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
    const files = [...testObjects.keys()].filter((file) => modelOf(file) === name);

    expect(files.filter((file) => listedObjects.has(file))).not.toEqual([]);
    for (const file of files) {
      expect(testObjects.get(file), file).toMatchObject({
        kind: kubeObjectClass.kind,
        apiVersion: kubeObjectClass.crd?.apiVersions[0],
      });
    }
  });

  it("have a model for every test object, and list every test object", () => {
    for (const file of testObjects.keys()) {
      expect(modelClasses.has(modelOf(file)), file).toBe(true);
      expect(listedObjects).toContain(file);
    }
  });

  it("list a variant of a test object for the Flux version it names", () => {
    for (const file of testObjects.keys()) {
      const version = fluxVersionOf(file);
      if (file !== `${modelOf(file)}.yaml`) {
        expect(version, file).toBeDefined();
      }
      if (version !== undefined) {
        expect(fluxVersions.flux[version]?.objects, file).toContain(file);
      }
    }
  });

  it("list every object that the test objects refer to, and only existing ones", () => {
    expect(resourceFiles.length).toBeGreaterThan(0);
    expect([...fluxVersions.resources].sort()).toEqual([...resourceFiles].sort());
  });

  it.each(fixtureSets)("list for %s existing objects, one per kind", (_name, { objects }) => {
    const kinds = objects.map((file) => testObjects.get(file)?.kind);

    expect(kinds).not.toContain(undefined);
    expect(new Set(kinds).size).toBe(kinds.length);
  });
});
