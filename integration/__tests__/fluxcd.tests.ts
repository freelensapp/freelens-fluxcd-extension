/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// One session with the CRDs of the newest Flux and the Flux Operator, which
// serve one API version of each kind, and one test object of every kind. The
// session disconnects the kind cluster, sets up the CRDs, connects the cluster
// again, so that the app reads the CRDs anew, and leaves the cluster
// disconnected; it does not depend on another test file having run.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  appReady,
  connectApp,
  disconnectKindCluster,
  installExtension,
  menuItemTitles,
  openDetails,
  openKindCluster,
  openListPage,
  openOverview,
  openRowMenu,
  setUpCluster,
  tearDownCluster,
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
  /** The name of the test object in `integration/fixtures/objects`. */
  name: string;
  /** An item that the extension's details panel shows for the test object. */
  detailsItem: string;
  /** The extension's items in the row menu; none for a kind that its controller does not reconcile. */
  menuItems: string[];
}

const reconcileAndSuspend = ["Reconcile", "Suspend"];

const kinds: KindView[] = [
  {
    kind: "FluxInstance",
    pageId: "fluxinstance",
    name: "flux",
    detailsItem: "Reconciliation Enabled",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "FluxReport",
    pageId: "fluxreport",
    name: "flux",
    detailsItem: "Reconciliation Enabled",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "ResourceSet",
    pageId: "resourceset",
    chart: "Resource Sets",
    name: "test",
    detailsItem: "Reconciliation Enabled",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "ResourceSetInputProvider",
    pageId: "resourcesetinputprovider",
    chart: "Resource Set Input Providers",
    name: "test",
    detailsItem: "Reconciliation Enabled",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "Kustomization",
    pageId: "kustomization",
    chart: "Kustomizations",
    name: "test",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "HelmRelease",
    pageId: "helmrelease",
    chart: "Helm Releases",
    name: "test",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "GitRepository",
    pageId: "gitrepository",
    chart: "Git Repositories",
    name: "test",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "HelmRepository",
    pageId: "helmrepository",
    chart: "Helm Repositories",
    name: "test",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "HelmChart",
    pageId: "helmchart",
    chart: "Helm Charts",
    name: "test",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "Bucket",
    pageId: "bucket",
    chart: "Buckets",
    name: "test",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "OCIRepository",
    pageId: "ocirepository",
    chart: "OCI Repositories",
    name: "test",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "ExternalArtifact",
    pageId: "externalartifact",
    chart: "External Artifacts",
    name: "test",
    detailsItem: "Source",
    menuItems: [],
  },
  {
    kind: "ArtifactGenerator",
    pageId: "artifactgenerator",
    chart: "Artifact Generators",
    name: "test",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "ImageRepository",
    pageId: "imagerepository",
    chart: "Image Repositories",
    name: "test",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "ImagePolicy",
    pageId: "imagepolicy",
    chart: "Image Policies",
    name: "test",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "ImageUpdateAutomation",
    pageId: "imageupdateautomation",
    chart: "Image Update Automations",
    name: "test",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "Alert",
    pageId: "alert",
    chart: "Alerts",
    name: "test",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "Provider",
    pageId: "provider",
    chart: "Providers",
    name: "test",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
  {
    kind: "Receiver",
    pageId: "receiver",
    chart: "Receivers",
    name: "test",
    detailsItem: "Resumed",
    menuItems: reconcileAndSuspend,
  },
];

// The titles of every menu item of the extension, to tell them from the host's.
const extensionMenuItems = ["Reconcile", "Suspend", "Resume"];

describe.skipIf(!(await appReady({ cluster: true })))("FluxCD views", () => {
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
        // The cluster first: the app watches the CRDs, and would log errors for
        // a CRD deleted under it.
        if (session) {
          await disconnectKindCluster(session);
        }

        errors = (await session?.close()) ?? [];
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

  it.each(kinds)("shows the details of the $kind test object", async ({ pageId, name, detailsItem }) => {
    const row = await openListPage(frame, pageId, name);

    await openDetails(frame, row, name, detailsItem);
  });

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
