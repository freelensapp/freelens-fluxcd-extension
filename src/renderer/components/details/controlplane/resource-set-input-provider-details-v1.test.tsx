// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ResourceSetInputProvider } from "../../../k8s/fluxcd/controlplane/resourcesetinputprovider-v1";
import { ResourceSetInputProviderDetails } from "./resource-set-input-provider-details-v1";

afterEach(() => {
  cleanup();
});

type DetailsProps = Parameters<typeof ResourceSetInputProviderDetails>[0];

const resourceSetInputProvider = (spec: Record<string, unknown>, status?: Record<string, unknown>) =>
  new ResourceSetInputProvider({
    apiVersion: "fluxcd.controlplane.io/v1",
    kind: "ResourceSetInputProvider",
    metadata: { name: "artifacts", namespace: "fluxcd-test" },
    spec: { type: "ExternalArtifact", ...spec },
    status,
  } as unknown as ConstructorParameters<typeof ResourceSetInputProvider>[0]);

const renderDetails = (object: ResourceSetInputProvider) =>
  render(<ResourceSetInputProviderDetails {...({ object } as unknown as DetailsProps)} />);

const drawerItems = () => screen.getAllByTestId("drawer-item").map((item) => item.textContent);

describe("ResourceSetInputProviderDetails", () => {
  it("shows the namespace of the provider for a selector with neither namespace nor namespaceSelector", () => {
    renderDetails(resourceSetInputProvider({ selectors: [{ matchLabels: { app: "podinfo" } }] }));

    const items = drawerItems();
    expect(items).toContain("Namespace: fluxcd-test");
    expect(items).toContain("Match Labels: app=podinfo");
    expect(items.some((item) => item?.startsWith("Namespace Selector: "))).toBe(false);
  });

  it("shows the namespace of a selector with namespace", () => {
    renderDetails(resourceSetInputProvider({ selectors: [{ name: "podinfo", namespace: "apps" }] }));

    const items = drawerItems();
    expect(items).toContain("Namespace: apps");
    expect(items).toContain("Name: podinfo");
    expect(items.some((item) => item?.startsWith("Namespace Selector: "))).toBe(false);
  });

  it("shows all namespaces for a selector with the namespace *", () => {
    renderDetails(resourceSetInputProvider({ selectors: [{ name: "podinfo", namespace: "*" }] }));

    expect(drawerItems()).toContain("Namespace: All namespaces");
  });

  it("shows the namespaceSelector of a selector in place of its namespace", () => {
    renderDetails(
      resourceSetInputProvider({
        selectors: [
          {
            matchLabels: { app: "podinfo" },
            namespaceSelector: {
              matchLabels: { tenant: "team-a" },
              matchExpressions: [{ key: "env", operator: "In", values: ["dev", "prod"] }],
            },
          },
        ],
      }),
    );

    const items = drawerItems();
    expect(items.some((item) => item?.startsWith("Namespace: "))).toBe(false);
    const namespaceSelector = items.find((item) => item?.startsWith("Namespace Selector: "));
    expect(namespaceSelector).toContain("Match Labels: tenant=team-a");
    expect(namespaceSelector).toContain("Key: env");
    expect(namespaceSelector).toContain("Operator: In");
    expect(namespaceSelector).toContain("Values: devprod");
    expect(namespaceSelector).not.toContain("app=podinfo");
    expect(items).toContain("Match Labels: app=podinfo");
  });

  it("shows all namespaces for a selector with an empty namespaceSelector", () => {
    renderDetails(resourceSetInputProvider({ selectors: [{ name: "podinfo", namespaceSelector: {} }] }));

    const items = drawerItems();
    expect(items).toContain("Namespace Selector: All namespaces");
    expect(items.some((item) => item?.startsWith("Namespace: "))).toBe(false);
  });

  it("shows when the provider last handled a force request", () => {
    renderDetails(resourceSetInputProvider({}, { lastHandledForceAt: "2026-11-26T10:00:00Z" }));

    expect(drawerItems()).toContain("Last Handled Force At: 2026-11-26T10:00:00Z");
  });

  it("hides Last Handled Force At without the field", () => {
    renderDetails(resourceSetInputProvider({}, {}));

    expect(drawerItems().some((item) => item?.startsWith("Last Handled Force At: "))).toBe(false);
  });
});
