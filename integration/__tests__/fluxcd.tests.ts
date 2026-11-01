/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// One session with the CRDs of one Flux version, TEST_FLUX_VERSION or the
// newest of integration/fixtures/flux-versions.yaml, and of the Flux Operator,
// and a test object of every kind that the version has, in the API version
// that the page of the kind picks on it, with the objects of resources/ that
// the test objects refer to. The session disconnects the kind cluster, sets up the CRDs, connects the cluster
// again, so that the app reads the CRDs anew, and leaves the cluster
// disconnected; it does not depend on another test file having run.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  appReady,
  connectApp,
  disconnectKindCluster,
  expectDetailsApiVersion,
  fluxVersion,
  installExtension,
  menuItemTitles,
  openDetails,
  openKindCluster,
  openListPage,
  openOverview,
  openRowMenu,
  setUpCluster,
  tearDownCluster,
  testObjects,
  waitForMenuItem,
} from "./extension-helpers";

import type { Frame } from "playwright";

import type { AppSession } from "./extension-helpers";

interface KindView {
  kind: string;
  /** The `id` of the kind's `clusterPages` registration. */
  pageId: string;
  /** The `crd.title` of the kind's models, the title of its Overview chart; none for a kind the Overview leaves out. */
  chart?: string;
  /** An item that the extension's details panel shows for the test object. */
  detailsItem: string;
  /** The extension's items in the row menu; none for a kind that its controller does not reconcile. */
  menuItems: string[];
}

const reconcileAndSuspend = ["Reconcile", "Suspend"];

const kindViews: KindView[] = [
  {
    kind: "FluxInstance",
    pageId: "fluxinstance",
    detailsItem: "Reconciliation Enabled",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "FluxReport",
    pageId: "fluxreport",
    detailsItem: "Reconciliation Enabled",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "ResourceSet",
    pageId: "resourceset",
    chart: "Resource Sets",
    detailsItem: "Reconciliation Enabled",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "ResourceSetInputProvider",
    pageId: "resourcesetinputprovider",
    chart: "Resource Set Input Providers",
    detailsItem: "Reconciliation Enabled",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "Kustomization",
    pageId: "kustomization",
    chart: "Kustomizations",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "HelmRelease",
    pageId: "helmrelease",
    chart: "Helm Releases",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "GitRepository",
    pageId: "gitrepository",
    chart: "Git Repositories",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "HelmRepository",
    pageId: "helmrepository",
    chart: "Helm Repositories",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "HelmChart",
    pageId: "helmchart",
    chart: "Helm Charts",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "Bucket",
    pageId: "bucket",
    chart: "Buckets",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "OCIRepository",
    pageId: "ocirepository",
    chart: "OCI Repositories",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "ExternalArtifact",
    pageId: "externalartifact",
    chart: "External Artifacts",
    detailsItem: "Source",
    menuItems: [],
  },
  {
    kind: "ArtifactGenerator",
    pageId: "artifactgenerator",
    chart: "Artifact Generators",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "ImageRepository",
    pageId: "imagerepository",
    chart: "Image Repositories",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "ImagePolicy",
    pageId: "imagepolicy",
    chart: "Image Policies",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "ImageUpdateAutomation",
    pageId: "imageupdateautomation",
    chart: "Image Update Automations",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "Alert",
    pageId: "alert",
    chart: "Alerts",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "Provider",
    pageId: "provider",
    chart: "Providers",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "Receiver",
    pageId: "receiver",
    chart: "Receivers",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
];

// The kinds of the session's test objects, each with its object.
const kinds = testObjects().map((object) => {
  const view = kindViews.find(({ kind }) => kind === object.kind);

  if (!view) {
    throw new Error(`fluxcd.tests.ts has no view of ${object.kind}`);
  }

  return { ...view, ...object };
});

// The titles of every menu item of the extension, to tell them from the host's.
const extensionMenuItems = ["Reconcile", "Suspend", "Resume"];

describe.skipIf(!(await appReady({ cluster: true })))(`FluxCD views with Flux ${fluxVersion}`, () => {
  let session: AppSession | undefined;
  let frame: Frame;

  beforeAll(
    async () => {
      session = await connectApp();
      await disconnectKindCluster(session);
      setUpCluster();
      await installExtension(session);
      frame = await openKindCluster(session);
    },
    10 * 60 * 1000,
  );

  afterAll(
    async () => {
      let errors: string[] = [];

      try {
        // The errors first: the app refreshes the cluster while it disconnects,
        // and logs errors of its own when the refresh loses the race.
        errors = (await session?.stopCollecting()) ?? [];

        // The cluster then: the app watches the CRDs, and would log errors for
        // a CRD deleted under it.
        if (session) {
          await disconnectKindCluster(session);
        }

        await session?.close();
      } finally {
        tearDownCluster();
      }

      expect(errors).toEqual([]);
    },
    10 * 60 * 1000,
  );

  it.each(kinds.filter(({ chart }) => chart))("shows the $kind chart on the Overview", async ({ chart }) => {
    await openOverview(frame, chart as string, 1);
  });

  it.each(kinds)("lists the $kind test object", async ({ pageId, name }) => {
    await openListPage(frame, pageId, name);
  });

  it.each(kinds)(
    "shows the details of the $kind test object, in $apiVersion",
    async ({ pageId, name, apiVersion, detailsItem }) => {
      const row = await openListPage(frame, pageId, name);

      await openDetails(frame, row, name, detailsItem);
      await expectDetailsApiVersion(frame, apiVersion);
    },
  );

  it.each(kinds)("shows the extension's menu items for the $kind test object", async ({ pageId, name, menuItems }) => {
    const row = await openListPage(frame, pageId, name);
    const menu = await openRowMenu(frame, row);

    for (const title of menuItems) {
      await waitForMenuItem(menu, title);
    }

    const titles = await menuItemTitles(menu);

    expect(titles.filter((title) => extensionMenuItems.includes(title))).toEqual(menuItems);
  });
});
