// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Receiver } from "../../../k8s/fluxcd/notification/receiver-v1";
import { ReceiverDetails } from "./receiver-details-v1";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

type DetailsProps = Parameters<typeof ReceiverDetails>[0];

const receiver = (spec: Record<string, unknown>) =>
  new Receiver({
    apiVersion: "notification.toolkit.fluxcd.io/v1",
    kind: "Receiver",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: { type: "generic", resources: [], ...spec },
  } as unknown as ConstructorParameters<typeof Receiver>[0]);

const renderDetails = (object: Receiver) => render(<ReceiverDetails {...({ object } as unknown as DetailsProps)} />);

describe("ReceiverDetails", () => {
  it("renders the resources named * of one kind as rows of their own, with no React key error", () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    renderDetails(
      receiver({
        resources: [
          { kind: "GitRepository", name: "*", matchLabels: { app: "podinfo" } },
          { kind: "GitRepository", name: "*", matchLabels: { app: "flux" } },
        ],
      }),
    );

    const rows = screen.getAllByRole("row").map((row) => row.textContent);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toContain("app=podinfo");
    expect(rows[1]).toContain("app=flux");
    expect(error).not.toHaveBeenCalled();
  });

  it("shows the default audience of notification-controller for an OIDC provider without one", () => {
    renderDetails(
      receiver({
        type: "generic-oidc",
        oidcProviders: [
          { issuerURL: "https://token.actions.githubusercontent.com", validations: [] },
          {
            issuerURL: "https://gitlab.com",
            audience: "flux",
            validations: [{ expression: "claims.sub != ''", message: "no subject" }],
          },
        ],
      }),
    );

    const audiences = screen
      .getAllByTestId("drawer-item")
      .map((item) => item.textContent)
      .filter((item) => item?.startsWith("Audience: "));
    expect(audiences).toEqual(["Audience: notification-controller", "Audience: flux"]);
  });

  it("shows the default interval of 10m for a Receiver without one", () => {
    renderDetails(receiver({}));

    expect(screen.getAllByTestId("drawer-item").map((item) => item.textContent)).toContain("Interval: 10m");
  });

  it("shows the interval of the Receiver", () => {
    renderDetails(receiver({ interval: "1h" }));

    expect(screen.getAllByTestId("drawer-item").map((item) => item.textContent)).toContain("Interval: 1h");
  });
});
