// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getStats } from "./pie-chart";
import { FluxCDStatusCard, getStatusCardStatuses } from "./status-card";

afterEach(() => {
  cleanup();
});

type StatsObject = Parameters<typeof getStats>[0][number];

const object = (data: { spec?: Record<string, unknown>; status?: Record<string, unknown> }) =>
  ({ kind: "Kustomization", metadata: {}, spec: {}, ...data }) as unknown as StatsObject;

const readyCondition = (status: string) => ({ conditions: [{ type: "Ready", status }] });

// Two ready, one not ready, one in progress, one suspended and none unknown, so that every count differs from the
// next one and a status that takes the count of another fails.
const objects = [
  object({ status: readyCondition("True") }),
  object({ status: readyCondition("True") }),
  object({ status: readyCondition("False") }),
  object({ status: readyCondition("Unknown") }),
  object({ spec: { suspend: true } }),
];

describe("getStatusCardStatuses", () => {
  it("has the categories of getStats, in the same order, with their tones and colors of the theme", () => {
    expect(getStatusCardStatuses(objects)).toEqual([
      { label: "Ready", count: 2, color: "var(--colorOk)", tone: "healthy" },
      { label: "Not Ready", count: 1, color: "var(--colorError)", tone: "failing" },
      { label: "In progress", count: 1, color: "var(--colorWarning)", tone: "neutral" },
      { label: "Suspended", count: 1, color: "var(--colorInfo)", tone: "neutral" },
      { label: "Unknown", count: 0, color: "var(--colorVague)", tone: "neutral" },
    ]);
  });

  it("has the counts of getStats", () => {
    expect(getStatusCardStatuses(objects).map(({ count }) => count)).toEqual(getStats(objects));
  });
});

describe("FluxCDStatusCard", () => {
  const crd = {
    spec: { names: { kind: "Kustomization", singular: "kustomization" } },
  } as Renderer.K8sApi.CustomResourceDefinition;

  it("shows the title of the kind and its statuses", () => {
    const extension: Partial<Renderer.LensExtension> = { navigate: vi.fn(() => Promise.resolve()) };

    render(
      <FluxCDStatusCard
        extension={extension as Renderer.LensExtension}
        title="Kustomizations"
        objects={objects}
        crd={crd}
      />,
    );

    expect(screen.getByRole("heading").textContent).toBe("Kustomizations");
    expect(
      screen.getAllByTestId("status").map((status) => [status.textContent, status.dataset.tone, status.dataset.color]),
    ).toEqual([
      ["Ready: 2", "healthy", "var(--colorOk)"],
      ["Not Ready: 1", "failing", "var(--colorError)"],
      ["In progress: 1", "neutral", "var(--colorWarning)"],
      ["Suspended: 1", "neutral", "var(--colorInfo)"],
      ["Unknown: 0", "neutral", "var(--colorVague)"],
    ]);
  });

  it("opens the cluster page of the kind through the extension", () => {
    const navigate = vi.fn(() => Promise.resolve());
    const extension: Partial<Renderer.LensExtension> = { navigate };

    render(
      <FluxCDStatusCard
        extension={extension as Renderer.LensExtension}
        title="Kustomizations"
        objects={objects}
        crd={crd}
      />,
    );
    fireEvent.click(screen.getByRole("button"));

    expect(navigate).toHaveBeenCalledExactlyOnceWith("kustomization");
  });
});
