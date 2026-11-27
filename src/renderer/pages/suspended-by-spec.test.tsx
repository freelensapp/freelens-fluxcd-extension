// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HelmRelease as HelmRelease_v2 } from "../k8s/fluxcd/helm/helmrelease-v2";
import { HelmRelease as HelmRelease_v2beta1 } from "../k8s/fluxcd/helm/helmrelease-v2beta1";
import { HelmRelease as HelmRelease_v2beta2 } from "../k8s/fluxcd/helm/helmrelease-v2beta2";
import { Kustomization } from "../k8s/fluxcd/kustomize/kustomization-v1";
import { Bucket as Bucket_v1 } from "../k8s/fluxcd/source/bucket-v1";
import { Bucket as Bucket_v1beta2 } from "../k8s/fluxcd/source/bucket-v1beta2";
import { GitRepository } from "../k8s/fluxcd/source/gitrepository-v1";
import { HelmChart as HelmChart_v1 } from "../k8s/fluxcd/source/helmchart-v1";
import { HelmChart as HelmChart_v1beta2 } from "../k8s/fluxcd/source/helmchart-v1beta2";
import { HelmRepository as HelmRepository_v1 } from "../k8s/fluxcd/source/helmrepository-v1";
import { HelmRepository as HelmRepository_v1beta2 } from "../k8s/fluxcd/source/helmrepository-v1beta2";
import { OCIRepository as OCIRepository_v1 } from "../k8s/fluxcd/source/ocirepository-v1";
import { OCIRepository as OCIRepository_v1beta2 } from "../k8s/fluxcd/source/ocirepository-v1beta2";
import { HelmReleasesPage as HelmReleasesPage_v2 } from "./helm/helmreleases-v2";
import { HelmReleasesPage as HelmReleasesPage_v2beta1 } from "./helm/helmreleases-v2beta1";
import { HelmReleasesPage as HelmReleasesPage_v2beta2 } from "./helm/helmreleases-v2beta2";
import { KustomizationsPage_v1 } from "./kustomize/kustomizations-v1";
import { BucketsPage as BucketsPage_v1 } from "./source/buckets-v1";
import { BucketsPage as BucketsPage_v1beta2 } from "./source/buckets-v1beta2";
import { GitRepositoriesPage } from "./source/gitrepositories-v1";
import { HelmChartsPage as HelmChartsPage_v1 } from "./source/helmcharts-v1";
import { HelmChartsPage as HelmChartsPage_v1beta2 } from "./source/helmcharts-v1beta2";
import { HelmRepositoriesPage as HelmRepositoriesPage_v1 } from "./source/helmrepositories-v1";
import { HelmRepositoriesPage as HelmRepositoriesPage_v1beta2 } from "./source/helmrepositories-v1beta2";
import { OCIRepositoriesPage as OCIRepositoriesPage_v1 } from "./source/ocirepositories-v1";
import { OCIRepositoriesPage as OCIRepositoriesPage_v1beta2 } from "./source/ocirepositories-v1beta2";

import type React from "react";

const extension = { name: "fluxcd-extension" } as Renderer.LensExtension;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

// The fields of the spec that the pages read, besides `suspend`.
const sourceRef = { kind: "GitRepository", name: "podinfo" };
const spec = { url: "https://example.com/podinfo", chart: "podinfo", bucketName: "podinfo", sourceRef };
const helmReleaseSpec = {
  chart: { spec: { chart: "podinfo", sourceRef: { kind: "HelmRepository", name: "podinfo" } } },
};

// The kinds with `spec.suspend` that have a Suspended column, each with its page and the fields of its spec.
const pages: {
  kubeObjectClass: typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>;
  Page: React.ComponentType<{ extension: Renderer.LensExtension }>;
  spec: Record<string, unknown>;
}[] = [
  { kubeObjectClass: Bucket_v1, Page: BucketsPage_v1, spec },
  { kubeObjectClass: Bucket_v1beta2, Page: BucketsPage_v1beta2, spec },
  { kubeObjectClass: GitRepository, Page: GitRepositoriesPage, spec },
  { kubeObjectClass: HelmChart_v1, Page: HelmChartsPage_v1, spec },
  { kubeObjectClass: HelmChart_v1beta2, Page: HelmChartsPage_v1beta2, spec },
  { kubeObjectClass: HelmRepository_v1, Page: HelmRepositoriesPage_v1, spec },
  { kubeObjectClass: HelmRepository_v1beta2, Page: HelmRepositoriesPage_v1beta2, spec },
  { kubeObjectClass: OCIRepository_v1, Page: OCIRepositoriesPage_v1, spec },
  { kubeObjectClass: OCIRepository_v1beta2, Page: OCIRepositoriesPage_v1beta2, spec },
  { kubeObjectClass: Kustomization, Page: KustomizationsPage_v1, spec },
  { kubeObjectClass: HelmRelease_v2, Page: HelmReleasesPage_v2, spec: helmReleaseSpec },
  { kubeObjectClass: HelmRelease_v2beta1, Page: HelmReleasesPage_v2beta1, spec: helmReleaseSpec },
  { kubeObjectClass: HelmRelease_v2beta2, Page: HelmReleasesPage_v2beta2, spec: helmReleaseSpec },
];

// A ready object, as the host's store holds it, with the fields the pages read.
const readyObject = (spec: Record<string, unknown>) => ({
  metadata: { name: "podinfo", namespace: "flux-system" },
  spec,
  status: {
    conditions: [
      {
        type: "Ready",
        status: "True",
        reason: "Succeeded",
        message: "",
        lastTransitionTime: "2026-10-01T00:00:00Z",
      },
    ],
  },
  getName: () => "podinfo",
  getNs: () => "flux-system",
  getCreationTimestamp: () => "2026-10-01T00:00:00Z",
  getSearchFields: () => [],
});

const renderPage = (page: (typeof pages)[number], suspend?: boolean) => {
  const objectSpec = suspend === undefined ? page.spec : { ...page.spec, suspend };
  vi.spyOn(page.kubeObjectClass, "getStore").mockReturnValue({ items: [readyObject(objectSpec)] } as never);
  render(<page.Page extension={extension} />);
};

// The classes are those of the stub's `getBooleanClass`: `false` is the color of an error, `true` of a success.
describe.each(pages)(
  "the Suspended column of the $kubeObjectClass.kind page of $kubeObjectClass.crd.apiVersions",
  (page) => {
    it("shows a suspended object as True, in the color of False", () => {
      renderPage(page, true);

      expect(screen.getByText("True").className).toBe("false");
      expect(screen.queryByText("False")).toBeNull();
    });

    it.each([false, undefined])("shows an object with suspend %s as False, in the color of True", (suspend) => {
      renderPage(page, suspend);

      expect(screen.getByText("False").className).toBe("true");
      expect(screen.queryByText("True")).toBeNull();
    });
  },
);
