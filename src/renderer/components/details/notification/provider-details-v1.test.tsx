// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Provider } from "../../../k8s/fluxcd/notification/provider-v1";
import { ProviderDetails } from "./provider-details-v1";

afterEach(() => {
  cleanup();
});

type DetailsProps = Parameters<typeof ProviderDetails>[0];

const provider = (spec: Record<string, unknown>) =>
  new Provider({
    apiVersion: "notification.toolkit.fluxcd.io/v1",
    kind: "Provider",
    metadata: { name: "slack", namespace: "fluxcd-test" },
    spec,
  } as unknown as ConstructorParameters<typeof Provider>[0]);

const renderDetails = (object: Provider) => render(<ProviderDetails {...({ object } as unknown as DetailsProps)} />);

describe("ProviderDetails v1", () => {
  it("shows the type", () => {
    renderDetails(provider({ type: "slack", channel: "general" }));

    const items = screen.getAllByTestId("drawer-item").map((item) => item.textContent);
    expect(items).toContain("Type: slack");
  });
});
