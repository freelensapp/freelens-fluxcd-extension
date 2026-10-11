import { Renderer } from "@freelensapp/extensions";
import { describe, expect, it } from "vitest";
import FluxCDExtension from "./index";

type KubeObjectClass = typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>;

// Every model of the extension, one module per version of a kind. Each of them
// has a page, so each belongs in `customResources`; a model without a page yet
// is left out.
const modelModules = import.meta.glob<Record<string, unknown>>(
  ["./k8s/fluxcd/*/*.ts", "!./k8s/fluxcd/*/*.test.ts", "!./k8s/fluxcd/source/externalartifact-v1.ts"],
  { eager: true },
);

const modelClasses = Object.values(modelModules).flatMap((module) =>
  Object.values(module).filter(
    (value): value is KubeObjectClass =>
      typeof value === "function" && value.prototype instanceof Renderer.K8sApi.LensExtensionKubeObject,
  ),
);

const describeClass = (kubeObjectClass: KubeObjectClass) =>
  `${kubeObjectClass.kind} ${kubeObjectClass.crd?.apiVersions.join(", ")}`;

describe("FluxCDExtension", () => {
  // The host constructs the extension with the installed extension; the
  // registrations read none of it.
  const { customResources } = new FluxCDExtension({} as ConstructorParameters<typeof FluxCDExtension>[0]);

  it("finds the model classes", () => {
    expect(modelClasses.length).toBeGreaterThan(0);
  });

  it("registers every model class with a page in customResources", () => {
    expect(customResources.map(describeClass).sort()).toEqual(modelClasses.map(describeClass).sort());
    for (const modelClass of modelClasses) {
      expect(customResources).toContain(modelClass);
    }
  });

  it("registers each class once", () => {
    expect(new Set(customResources).size).toBe(customResources.length);
  });

  it("registers only classes that the host can read, of a custom resource group", () => {
    for (const kubeObjectClass of customResources) {
      expect(kubeObjectClass.kind).toBeTruthy();
      expect(kubeObjectClass.crd?.plural).toBeTruthy();
      expect(kubeObjectClass.crd?.apiVersions.length).toBeGreaterThan(0);
      for (const apiVersion of kubeObjectClass.crd?.apiVersions ?? []) {
        expect(apiVersion).toMatch(/^[^/]+\.[^/]+\/[^/]+$/);
      }
    }
  });
});
