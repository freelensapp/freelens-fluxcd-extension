// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Alert } from "../../../k8s/fluxcd/notification/alert-v1";
import { AlertDetails } from "./alert-details-v1";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

type DetailsProps = Parameters<typeof AlertDetails>[0];

const alert = (eventSources: Record<string, unknown>[]) =>
  new Alert({
    apiVersion: "notification.toolkit.fluxcd.io/v1",
    kind: "Alert",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: { providerRef: { name: "slack" }, eventSources },
  } as unknown as ConstructorParameters<typeof Alert>[0]);

const renderDetails = (object: Alert) => render(<AlertDetails {...({ object } as unknown as DetailsProps)} />);

describe("AlertDetails v1", () => {
  // `matchLabels` of `CrossNamespaceObjectReference` tells apart the event sources named * of one kind and
  // namespace.
  it("renders the event sources named * that differ only in matchLabels, with no React key error", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    renderDetails(
      alert([
        { kind: "GitRepository", name: "*", namespace: "flux-system", matchLabels: { app: "podinfo" } },
        { kind: "GitRepository", name: "*", namespace: "flux-system", matchLabels: { app: "flux" } },
      ]),
    );

    const eventSources = screen
      .getAllByTestId("drawer-item")
      .filter((item) => item.textContent === ": GitRepository:*");
    expect(eventSources).toHaveLength(2);
    expect(error).not.toHaveBeenCalled();
  });
});
