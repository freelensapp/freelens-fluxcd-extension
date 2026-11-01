// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StatusHistory } from "./status-history";

import type { History } from "../k8s/fluxcd/types";

afterEach(() => {
  cleanup();
});

const history: History = [
  {
    digest: "sha256:def",
    firstReconciled: "2026-10-31T10:00:00Z",
    lastReconciled: "2026-11-01T10:00:00Z",
    lastReconciledDuration: "2.5s",
    lastReconciledStatus: "ReconciliationSucceeded",
    totalReconciliations: 24,
    metadata: { revision: "v1.1.0" },
  },
  {
    digest: "sha256:abc",
    firstReconciled: "2026-10-30T10:00:00Z",
    lastReconciled: "2026-10-31T09:00:00Z",
    lastReconciledDuration: "1s",
    lastReconciledStatus: "HealthCheckFailed",
    totalReconciliations: 3,
  },
];

describe("StatusHistory", () => {
  it("renders the entries of a history, newest first, as they are", () => {
    render(<StatusHistory history={history} />);

    expect(screen.getByText("History")).toBeTruthy();
    expect(screen.getAllByTestId("drawer-item").map((item) => item.textContent)).toEqual([
      "Digest: sha256:def",
      "First Reconciled: 2026-10-31T10:00:00Z",
      "Last Reconciled: 2026-11-01T10:00:00Z",
      "Last Reconciled Duration: 2.5s",
      "Last Reconciled Status: ReconciliationSucceeded",
      "Total Reconciliations: 24",
      "Metadata: revision=v1.1.0",
      "Digest: sha256:abc",
      "First Reconciled: 2026-10-30T10:00:00Z",
      "Last Reconciled: 2026-10-31T09:00:00Z",
      "Last Reconciled Duration: 1s",
      "Last Reconciled Status: HealthCheckFailed",
      "Total Reconciliations: 3",
    ]);
  });

  it("renders nothing without a history", () => {
    const { container } = render(<StatusHistory />);

    expect(container.innerHTML).toBe("");
  });

  it("renders nothing for an empty history", () => {
    const { container } = render(<StatusHistory history={[]} />);

    expect(container.innerHTML).toBe("");
  });
});
