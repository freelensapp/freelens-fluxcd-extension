// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { StatusArtifact } from "./status-artifact";

import type { Artifact } from "../k8s/fluxcd/types";

afterEach(() => {
  cleanup();
});

const items = () => screen.queryAllByTestId("drawer-item").map((item) => item.textContent);

describe("StatusArtifact", () => {
  it("shows the digest and the metadata of a v1 artifact, and no checksum", () => {
    const artifact: Artifact = {
      path: "externalartifact/default/podinfo/sha256:abc.tar.gz",
      url: "http://source-watcher.flux-system.svc.cluster.local./externalartifact/default/podinfo/sha256:abc.tar.gz",
      revision: "latest@sha256:abc",
      digest: "sha256:abc",
      lastUpdateTime: "2026-10-11T12:00:00Z",
      metadata: { "org.opencontainers.image.source": "https://github.com/stefanprodan/podinfo" },
    };

    render(<StatusArtifact artifact={artifact} />);

    expect(items()).toEqual([
      `Path: ${artifact.path}`,
      `URL: ${artifact.url}`,
      "Revision: latest@sha256:abc",
      "Digest: sha256:abc",
      "Last Update Time: 2026-10-11T12:00:00Z",
      "Metadata: org.opencontainers.image.source=https://github.com/stefanprodan/podinfo",
    ]);
  });

  it("shows the checksum of a v1beta1 artifact, and no digest or metadata", () => {
    const artifact: Artifact = {
      path: "gitrepository/default/podinfo/abc.tar.gz",
      url: "http://source-controller.flux-system.svc.cluster.local./gitrepository/default/podinfo/abc.tar.gz",
      revision: "main/abc",
      checksum: "0123456789abcdef",
      lastUpdateTime: "2026-10-11T12:00:00Z",
    };

    render(<StatusArtifact artifact={artifact} />);

    expect(items()).toEqual([
      `Path: ${artifact.path}`,
      `URL: ${artifact.url}`,
      "Revision: main/abc",
      "Checksum: 0123456789abcdef",
      "Last Update Time: 2026-10-11T12:00:00Z",
    ]);
  });

  it("hides the revision of an artifact that has none, which v1beta1 and v1beta2 allow", () => {
    const artifact: Artifact = {
      path: "bucket/default/podinfo/abc.tar.gz",
      url: "http://source-controller.flux-system.svc.cluster.local./bucket/default/podinfo/abc.tar.gz",
      lastUpdateTime: "2026-10-11T12:00:00Z",
    };

    render(<StatusArtifact artifact={artifact} />);

    expect(items()).toEqual([
      `Path: ${artifact.path}`,
      `URL: ${artifact.url}`,
      "Last Update Time: 2026-10-11T12:00:00Z",
    ]);
  });

  it("renders nothing without an artifact", () => {
    const { container } = render(<StatusArtifact />);

    expect(container.innerHTML).toBe("");
  });
});
