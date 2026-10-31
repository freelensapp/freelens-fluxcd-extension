import { Renderer } from "@freelensapp/extensions";
import { Component, type ComponentType, type FunctionComponent, isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import { ErrorBoundary, type ErrorBoundaryProps } from "./components/error-boundary";
import FluxCDExtension from "./index";
import { FluxInstance } from "./k8s/fluxcd/controlplane/fluxinstance-v1";
import { FluxReport } from "./k8s/fluxcd/controlplane/fluxreport-v1";
import { ResourceSet } from "./k8s/fluxcd/controlplane/resourceset-v1";
import { ResourceSetInputProvider } from "./k8s/fluxcd/controlplane/resourcesetinputprovider-v1";
import { ArtifactGenerator } from "./k8s/fluxcd/source/artifactgenerator-v1beta1";
import { FluxCDObjectAnnotationSuspendResumeMenuItem } from "./menus/fluxcd-object-annotation-suspend-resume-menu-item";
import { FluxCDObjectReconcileMenuItem } from "./menus/fluxcd-object-reconcile-menu-item";

type KubeObjectClass = typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>;

const isFunctionComponent = <P>(component: ComponentType<P>): component is FunctionComponent<P> =>
  !(component.prototype instanceof Component);

// Every model of the extension, one module per version of a kind. Each of them
// has a page, so each belongs in `customResources`.
const modelModules = import.meta.glob<Record<string, unknown>>(["./k8s/fluxcd/*/*.ts", "!./k8s/fluxcd/*/*.test.ts"], {
  eager: true,
});

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

  it("gives every model class the apiBase of its own version and plural", () => {
    for (const modelClass of modelClasses) {
      expect(modelClass.crd?.apiVersions).toHaveLength(1);
      expect(modelClass.apiBase, describeClass(modelClass)).toBe(
        `/apis/${modelClass.crd?.apiVersions[0]}/${modelClass.crd?.plural}`,
      );
    }
  });
});

// The element that a registered function component returns when called with
// `props`.
const callComponent = <P>(component: ComponentType<P>, props: P) => {
  if (!isFunctionComponent(component)) throw new Error(`${component.name} is not a function component`);
  const element = component(props);
  if (!isValidElement(element)) throw new Error(`${component.name} renders no element`);
  return element;
};

// The element of the error boundary that a registered component returns, and
// the one element inside it.
const unwrapErrorBoundary = (element: ReactElement) => {
  if (element.type !== ErrorBoundary) throw new Error("the component renders no ErrorBoundary");
  const { children, fallback } = element.props as ErrorBoundaryProps;
  if (!isValidElement(children)) throw new Error("the ErrorBoundary has no element inside");
  return { fallback, children };
};

describe("FluxCDExtension registrations", () => {
  const { clusterPages, kubeObjectDetailItems, kubeObjectMenuItems } = new FluxCDExtension(
    {} as ConstructorParameters<typeof FluxCDExtension>[0],
  );

  it("renders every page inside an error boundary that renders the error page", () => {
    expect(clusterPages.length).toBeGreaterThan(0);
    for (const { components } of clusterPages) {
      expect(unwrapErrorBoundary(callComponent(components.Page, { params: {} })).fallback).toBeUndefined();
    }
  });

  it("renders every details panel inside an error boundary that renders the error page", () => {
    expect(kubeObjectDetailItems.length).toBeGreaterThan(0);
    for (const { components } of kubeObjectDetailItems) {
      expect(unwrapErrorBoundary(callComponent(components.Details, { object: {} })).fallback).toBeUndefined();
    }
  });

  it("renders every menu item inside an error boundary that renders nothing", () => {
    expect(kubeObjectMenuItems.length).toBeGreaterThan(0);
    for (const { components } of kubeObjectMenuItems) {
      expect(unwrapErrorBoundary(callComponent(components.MenuItem, { object: {} })).fallback).toBe("nothing");
    }
  });
});

describe("FluxCDExtension.kubeObjectMenuItems", () => {
  const { kubeObjectMenuItems } = new FluxCDExtension({} as ConstructorParameters<typeof FluxCDExtension>[0]);

  // The element each menu item of the kind renders, for an object of the kind.
  // The registrations wrap the shared items in function components inside an
  // error boundary, which return the element when called.
  const renderMenuItems = (kubeObjectClass: KubeObjectClass) =>
    kubeObjectMenuItems
      .filter(
        ({ kind, apiVersions }) =>
          kind === kubeObjectClass.kind && apiVersions.join() === kubeObjectClass.crd?.apiVersions.join(),
      )
      .map(({ components: { MenuItem } }) => {
        const { children } = unwrapErrorBoundary(callComponent(MenuItem, { object: {} as never }));
        return callComponent(children.type as ComponentType<unknown>, children.props);
      });

  it("registers Reconcile and the annotation Suspend/Resume item for ArtifactGenerator", () => {
    const elements = renderMenuItems(ArtifactGenerator);

    expect(elements.map((element) => element.type)).toEqual([
      FluxCDObjectReconcileMenuItem,
      FluxCDObjectAnnotationSuspendResumeMenuItem,
    ]);
    for (const element of elements) {
      expect(element.props).toMatchObject({ resource: ArtifactGenerator });
    }
    expect(elements[1].props).toMatchObject({ annotation: "source.extensions.fluxcd.io/reconcile" });
  });

  it("passes the Flux Operator annotation to the annotation Suspend/Resume item of the Flux Operator kinds", () => {
    for (const kubeObjectClass of [FluxInstance, FluxReport, ResourceSet, ResourceSetInputProvider]) {
      const element = renderMenuItems(kubeObjectClass).find(
        (element) => element.type === FluxCDObjectAnnotationSuspendResumeMenuItem,
      );

      expect(element?.props).toMatchObject({
        resource: kubeObjectClass,
        annotation: "fluxcd.controlplane.io/reconcile",
      });
    }
  });
});
