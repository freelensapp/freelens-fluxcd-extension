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

// The nested drawer items of the event sources have no name.
const eventSourceItems = () =>
  screen
    .getAllByTestId("drawer-item")
    .map((item) => item.textContent)
    .filter((item) => item?.startsWith(": "));

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

    expect(eventSourceItems()).toEqual([
      ": GitRepository:flux-system/*app=podinfo",
      ": GitRepository:flux-system/*app=flux",
    ]);
    expect(error).not.toHaveBeenCalled();
  });

  it("shows the namespace of an event source that differs from the Alert's", () => {
    renderDetails(
      alert([
        { kind: "GitRepository", name: "*", namespace: "flux-system" },
        { kind: "Kustomization", name: "*", namespace: "fluxcd-test" },
        { kind: "HelmRelease", name: "*" },
      ]),
    );

    expect(eventSourceItems()).toEqual([": GitRepository:flux-system/*", ": Kustomization:*", ": HelmRelease:*"]);
  });

  it("shows the matchLabels of an event source as badges", () => {
    const { container } = renderDetails(
      alert([{ kind: "GitRepository", name: "*", matchLabels: { app: "podinfo", tier: "frontend" } }]),
    );

    // The first badge is the one of the Suspended item.
    expect([...container.querySelectorAll("span")].map((badge) => badge.textContent)).toEqual([
      "False",
      "GitRepository:*",
      "app=podinfo",
      "tier=frontend",
    ]);
  });
});
