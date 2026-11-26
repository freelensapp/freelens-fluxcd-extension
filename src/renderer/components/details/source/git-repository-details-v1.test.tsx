// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { GitRepository } from "../../../k8s/fluxcd/source/gitrepository-v1";
import { GitRepositoryDetails } from "./git-repository-details-v1";

afterEach(() => {
  cleanup();
});

type DetailsProps = Parameters<typeof GitRepositoryDetails>[0];

const gitRepository = (spec: Record<string, unknown> = {}, status?: Record<string, unknown>) =>
  new GitRepository({
    apiVersion: "source.toolkit.fluxcd.io/v1",
    kind: "GitRepository",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: { interval: "1m", url: "https://github.com/stefanprodan/podinfo", ...spec },
    status,
  } as unknown as ConstructorParameters<typeof GitRepository>[0]);

const renderDetails = (object: GitRepository) =>
  render(<GitRepositoryDetails {...({ object } as unknown as DetailsProps)} />);

// The text of each drawer item named `name`, nested ones included.
const drawerItems = (name: string) =>
  screen
    .queryAllByTestId("drawer-item")
    .map((item) => item.textContent)
    .filter((text) => text?.startsWith(`${name}: `));

describe("GitRepositoryDetails Last Handled Reconcile At", () => {
  it("hides the item without the field", () => {
    renderDetails(gitRepository());

    expect(drawerItems("Last Handled Reconcile At")).toEqual([]);
  });

  it("shows the time of the last handled reconcile request", () => {
    renderDetails(gitRepository({}, { lastHandledReconcileAt: "2026-11-26T12:00:00Z" }));

    expect(drawerItems("Last Handled Reconcile At")).toEqual(["Last Handled Reconcile At: 2026-11-26T12:00:00Z"]);
  });
});

describe("GitRepositoryDetails URL", () => {
  it("shows the URL of the repository", () => {
    renderDetails(gitRepository());

    expect(drawerItems("URL")).toEqual(["URL: https://github.com/stefanprodan/podinfo"]);
  });
});

describe("GitRepositoryDetails observed fields", () => {
  it("hides the observed fields without the status", () => {
    renderDetails(gitRepository());

    expect(drawerItems("Observed Source Ignore")).toEqual([]);
    expect(drawerItems("Observed Recurse Submodules")).toEqual([]);
    expect(drawerItems("Observed Sparse Checkout")).toEqual([]);
    expect(screen.queryByText("Included Artifacts")).toBeNull();
  });

  it("hides the observed sparse checkout with an empty list", () => {
    renderDetails(gitRepository({}, { observedSparseCheckout: [] }));

    expect(drawerItems("Observed Sparse Checkout")).toEqual([]);
  });

  it("shows the observed ignore, recurse submodules and sparse checkout", () => {
    renderDetails(
      gitRepository(
        {},
        {
          observedIgnore: "/*\n!/deploy",
          observedRecurseSubmodules: true,
          observedSparseCheckout: ["kustomize", "charts/podinfo"],
        },
      ),
    );

    expect(drawerItems("Observed Source Ignore")).toEqual(["Observed Source Ignore: /*\n!/deploy"]);
    expect(drawerItems("Observed Recurse Submodules")).toEqual(["Observed Recurse Submodules: True"]);
    expect(drawerItems("Observed Sparse Checkout")).toEqual(["Observed Sparse Checkout: kustomizecharts/podinfo"]);
  });

  it("shows each observed include with the artifact it included, by index", () => {
    renderDetails(
      gitRepository(
        { include: [{ repository: { name: "manifests" }, toPath: "deploy" }] },
        {
          observedInclude: [
            { repository: { name: "manifests" }, fromPath: "kustomize", toPath: "deploy" },
            { repository: { name: "charts" } },
          ],
          includedArtifacts: [
            {
              path: "gitrepository/fluxcd-test/manifests/abc.tar.gz",
              url: "http://source-controller/gitrepository/fluxcd-test/manifests/abc.tar.gz",
              revision: "main@sha1:abc",
              digest: "sha256:abc",
              lastUpdateTime: "2026-11-26T12:00:00Z",
            },
            {
              path: "gitrepository/fluxcd-test/charts/def.tar.gz",
              url: "http://source-controller/gitrepository/fluxcd-test/charts/def.tar.gz",
              revision: "main@sha1:def",
              lastUpdateTime: "2026-11-26T12:00:00Z",
            },
          ],
        },
      ),
    );

    expect(screen.getByText("Included Artifacts")).toBeTruthy();
    // The first "Git Repository", "From Path" and "To Path" are of spec.include.
    expect(drawerItems("Git Repository")).toEqual([
      "Git Repository: manifests",
      "Git Repository: manifests",
      "Git Repository: charts",
    ]);
    expect(drawerItems("From Path")).toEqual(["From Path: kustomize"]);
    expect(drawerItems("To Path")).toEqual(["To Path: deploy", "To Path: deploy"]);
    expect(drawerItems("Revision")).toEqual(["Revision: main@sha1:abc", "Revision: main@sha1:def"]);
    expect(drawerItems("Digest")).toEqual(["Digest: sha256:abc"]);
  });

  it("shows an included artifact without its observed include", () => {
    renderDetails(
      gitRepository(
        {},
        {
          includedArtifacts: [
            {
              path: "gitrepository/fluxcd-test/manifests/abc.tar.gz",
              url: "http://source-controller/gitrepository/fluxcd-test/manifests/abc.tar.gz",
              revision: "main@sha1:abc",
              lastUpdateTime: "2026-11-26T12:00:00Z",
            },
          ],
        },
      ),
    );

    expect(screen.getByText("Included Artifacts")).toBeTruthy();
    expect(drawerItems("Git Repository")).toEqual([]);
    expect(drawerItems("Revision")).toEqual(["Revision: main@sha1:abc"]);
  });
});
