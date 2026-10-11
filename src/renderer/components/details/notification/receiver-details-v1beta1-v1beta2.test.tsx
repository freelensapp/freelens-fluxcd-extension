// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Receiver as Receiver_v1beta1 } from "../../../k8s/fluxcd/notification/receiver-v1beta1";
import { Receiver as Receiver_v1beta2 } from "../../../k8s/fluxcd/notification/receiver-v1beta2";
import { ReceiverDetails as ReceiverDetails_v1beta1 } from "./receiver-details-v1beta1";
import { ReceiverDetails as ReceiverDetails_v1beta2 } from "./receiver-details-v1beta2";

afterEach(() => {
  cleanup();
});

// `events` is `+optional` in `ReceiverSpec` of notification-controller v1.6.0 (`api/v1beta1`) and v1.8.4
// (`api/v1beta2`), the last releases that serve these versions.
const versions = [
  {
    apiVersion: "notification.toolkit.fluxcd.io/v1beta1",
    Receiver: Receiver_v1beta1,
    ReceiverDetails: ReceiverDetails_v1beta1,
  },
  {
    apiVersion: "notification.toolkit.fluxcd.io/v1beta2",
    Receiver: Receiver_v1beta2,
    ReceiverDetails: ReceiverDetails_v1beta2,
  },
] as const;

describe.each(versions)("ReceiverDetails $apiVersion", ({ apiVersion, Receiver, ReceiverDetails }) => {
  const renderDetails = (spec: Record<string, unknown>) => {
    const object = new Receiver({
      apiVersion,
      kind: "Receiver",
      metadata: { name: "github", namespace: "fluxcd-test" },
      spec: { type: "generic", resources: [{ kind: "GitRepository", name: "podinfo" }], ...spec },
    } as never);
    const Details = ReceiverDetails as React.FC<{ object: typeof object }>;

    return render(<Details object={object} />);
  };

  const drawerItems = () => screen.getAllByTestId("drawer-item").map((item) => item.textContent);

  it("renders a spec without events", () => {
    renderDetails({});

    expect(drawerItems()).toContain("Events: ");
    expect(screen.getByText("podinfo")).toBeTruthy();
  });

  it("lists the events of a spec", () => {
    renderDetails({ events: ["push", "ping"] });

    expect(drawerItems()).toContain(": push");
    expect(drawerItems()).toContain(": ping");
  });
});
