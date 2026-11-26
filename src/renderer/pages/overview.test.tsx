// @vitest-environment jsdom

import { Common, Renderer } from "@freelensapp/extensions";
import { act, cleanup, render, screen } from "@testing-library/react";
import { observable, runInAction } from "mobx";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OverviewStatuses, type OverviewStatusesProps } from "./overview";

const { StatusCard } = Renderer.Component;
const { getOverviewStyle } = Common.App.Preferences;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  // Put back what a test removed to stand for Freelens v2.0.0.
  Object.assign(Renderer.Component, { StatusCard });
  Object.assign(Common.App.Preferences, { getOverviewStyle });
});

type Objects = OverviewStatusesProps["kinds"][number]["objects"];

const object = (status: string) =>
  ({
    kind: "Kustomization",
    metadata: {},
    spec: {},
    status: { conditions: [{ type: "Ready", status }] },
  }) as Objects[number];

const crd = (kind: string, singular: string) =>
  ({ spec: { names: { kind, singular } } }) as Renderer.K8sApi.CustomResourceDefinition;

const kinds: OverviewStatusesProps["kinds"] = [
  { title: "Kustomizations", crd: crd("Kustomization", "kustomization"), objects: [object("True"), object("False")] },
  { title: "Git Repositories", crd: crd("GitRepository", "gitrepository"), objects: [object("True")] },
];

const extension = {
  navigate: vi.fn(() => Promise.resolve()),
} as Partial<Renderer.LensExtension> as Renderer.LensExtension;

// The title of each chart, as a link with the number of objects, or of each card, as a heading.
const chartTitles = () => screen.queryAllByText(/ \(\d+\)$/).map((title) => title.textContent);
const cardTitles = () => screen.queryAllByTestId("status-card").map((card) => card.querySelector("h6")?.textContent);

const useOverviewStyle = (style: "cards" | "charts") =>
  vi.spyOn(Common.App.Preferences, "getOverviewStyle").mockReturnValue(style);

describe("OverviewStatuses", () => {
  it("shows the charts by default", () => {
    render(<OverviewStatuses extension={extension} kinds={kinds} />);

    expect(chartTitles()).toEqual(["Kustomizations (2)", "Git Repositories (1)"]);
    expect(cardTitles()).toEqual([]);
  });

  it("shows the charts with the Charts overview style", () => {
    useOverviewStyle("charts");

    render(<OverviewStatuses extension={extension} kinds={kinds} />);

    expect(chartTitles()).toEqual(["Kustomizations (2)", "Git Repositories (1)"]);
    expect(cardTitles()).toEqual([]);
  });

  it("shows a card per kind, in the same order, with the Cards overview style", () => {
    useOverviewStyle("cards");

    render(<OverviewStatuses extension={extension} kinds={kinds} />);

    expect(cardTitles()).toEqual(["Kustomizations", "Git Repositories"]);
    expect(chartTitles()).toEqual([]);
  });

  it("shows the charts on a host without getOverviewStyle, as Freelens v2.0.0", () => {
    Reflect.deleteProperty(Common.App.Preferences, "getOverviewStyle");

    render(<OverviewStatuses extension={extension} kinds={kinds} />);

    expect(chartTitles()).toEqual(["Kustomizations (2)", "Git Repositories (1)"]);
    expect(cardTitles()).toEqual([]);
  });

  it("shows the charts on a host without StatusCard, as Freelens v2.0.0", () => {
    useOverviewStyle("cards");
    Reflect.deleteProperty(Renderer.Component, "StatusCard");

    render(<OverviewStatuses extension={extension} kinds={kinds} />);

    expect(chartTitles()).toEqual(["Kustomizations (2)", "Git Repositories (1)"]);
    expect(cardTitles()).toEqual([]);
  });

  it("switches between charts and cards while it is open", () => {
    // Observable, as the host's preference.
    const style = observable.box<"cards" | "charts">("charts");
    vi.spyOn(Common.App.Preferences, "getOverviewStyle").mockImplementation(() => style.get());

    render(<OverviewStatuses extension={extension} kinds={kinds} />);
    expect(chartTitles()).toEqual(["Kustomizations (2)", "Git Repositories (1)"]);

    act(() => runInAction(() => style.set("cards")));
    expect(cardTitles()).toEqual(["Kustomizations", "Git Repositories"]);
    expect(chartTitles()).toEqual([]);

    act(() => runInAction(() => style.set("charts")));
    expect(chartTitles()).toEqual(["Kustomizations (2)", "Git Repositories (1)"]);
    expect(cardTitles()).toEqual([]);
  });
});
