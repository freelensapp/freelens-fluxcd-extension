// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Bucket } from "../../../k8s/fluxcd/source/bucket-v1";
import { BucketDetails } from "./bucket-details-v1";

afterEach(() => {
  cleanup();
});

type DetailsProps = Parameters<typeof BucketDetails>[0];

const bucket = (spec: Record<string, unknown> = {}, status?: Record<string, unknown>) =>
  new Bucket({
    apiVersion: "source.toolkit.fluxcd.io/v1",
    kind: "Bucket",
    metadata: { name: "podinfo", namespace: "fluxcd-test" },
    spec: { interval: "1m", bucketName: "podinfo", endpoint: "minio.minio.svc.cluster.local:9000", ...spec },
    status,
  } as unknown as ConstructorParameters<typeof Bucket>[0]);

const renderDetails = (object: Bucket) => render(<BucketDetails {...({ object } as unknown as DetailsProps)} />);

// The text of each drawer item named `name`, nested ones included.
const drawerItems = (name: string) =>
  screen
    .queryAllByTestId("drawer-item")
    .map((item) => item.textContent)
    .filter((text) => text?.startsWith(`${name}: `));

describe("BucketDetails Last Handled Reconcile At", () => {
  it("hides the item without the field", () => {
    renderDetails(bucket());

    expect(drawerItems("Last Handled Reconcile At")).toEqual([]);
  });

  it("shows the time of the last handled reconcile request", () => {
    renderDetails(bucket({}, { lastHandledReconcileAt: "2026-11-26T12:00:00Z" }));

    expect(drawerItems("Last Handled Reconcile At")).toEqual(["Last Handled Reconcile At: 2026-11-26T12:00:00Z"]);
  });
});
