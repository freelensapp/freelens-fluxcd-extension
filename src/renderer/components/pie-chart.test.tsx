// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PieChart } from "./pie-chart";

afterEach(() => {
  cleanup();
});

describe("PieChart", () => {
  it("opens the cluster page of the kind through the extension", () => {
    const navigate = vi.fn(() => Promise.resolve());
    const extension: Partial<Renderer.LensExtension> = { navigate };
    const crd = {
      spec: { names: { kind: "GitRepository", singular: "gitrepository" } },
    } as Renderer.K8sApi.CustomResourceDefinition;

    render(
      <PieChart extension={extension as Renderer.LensExtension} title="Git Repositories" objects={[]} crd={crd} />,
    );
    fireEvent.click(screen.getByText("Git Repositories (0)"));

    expect(navigate).toHaveBeenCalledExactlyOnceWith("gitrepository");
  });
});
