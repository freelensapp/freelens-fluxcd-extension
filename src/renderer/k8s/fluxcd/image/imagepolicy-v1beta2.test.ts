import { describe, expect, test } from "vitest";
import { ImagePolicy } from "./imagepolicy-v1beta2";

import type { ImagePolicyStatus } from "./imagepolicy-v1beta2";

const withStatus = (status?: ImagePolicyStatus) => ({ status }) as unknown as ImagePolicy;

describe("ImagePolicy.getImageTag", () => {
  test.each<[string | undefined, string | undefined]>([
    [undefined, undefined],
    ["", undefined],
    ["ghcr.io/stefanprodan/podinfo:6.15.0", "6.15.0"],
    ["ghcr.io/stefanprodan/podinfo:6.15.0@sha256:abc", "6.15.0"],
    ["localhost:5000/podinfo:6.15.0", "6.15.0"],
    ["localhost:5000/podinfo", undefined],
    ["podinfo", undefined],
    ["podinfo:", undefined],
  ])("reads the tag of %j as %j", (image, expected) => {
    expect(ImagePolicy.getImageTag(image)).toBe(expected);
  });
});

describe("ImagePolicy.getLatestTag", () => {
  test("returns undefined without a status", () => {
    expect(ImagePolicy.getLatestTag(withStatus(undefined))).toBeUndefined();
    expect(ImagePolicy.getLatestTag(withStatus({}))).toBeUndefined();
  });

  test("reads the tag of the latest ref", () => {
    const object = withStatus({ latestRef: { name: "ghcr.io/stefanprodan/podinfo", tag: "6.15.0" } });
    expect(ImagePolicy.getLatestTag(object)).toBe("6.15.0");
  });

  test("prefers the latest ref over the latest image", () => {
    const object = withStatus({
      latestRef: { name: "ghcr.io/stefanprodan/podinfo", tag: "6.15.0" },
      latestImage: "ghcr.io/stefanprodan/podinfo:6.14.0",
    });
    expect(ImagePolicy.getLatestTag(object)).toBe("6.15.0");
  });

  test("falls back to the latest image of an older controller", () => {
    const object = withStatus({ latestImage: "ghcr.io/stefanprodan/podinfo:6.14.0" });
    expect(ImagePolicy.getLatestTag(object)).toBe("6.14.0");
  });
});

describe("ImagePolicy.getLatestImage", () => {
  test("formats the latest ref, with the digest when set", () => {
    const object = withStatus({
      latestRef: { name: "ghcr.io/stefanprodan/podinfo", tag: "6.15.0", digest: "sha256:abc" },
      latestImage: "ghcr.io/stefanprodan/podinfo:6.14.0",
    });
    expect(ImagePolicy.getLatestImage(object)).toBe("ghcr.io/stefanprodan/podinfo:6.15.0@sha256:abc");
  });

  test("falls back to the latest image", () => {
    const object = withStatus({ latestImage: "ghcr.io/stefanprodan/podinfo:6.14.0" });
    expect(ImagePolicy.getLatestImage(object)).toBe("ghcr.io/stefanprodan/podinfo:6.14.0");
  });

  test("returns undefined without either field", () => {
    expect(ImagePolicy.getLatestImage(withStatus({}))).toBeUndefined();
    expect(ImagePolicy.getLatestImage(withStatus({ latestImage: "" }))).toBeUndefined();
  });
});

describe("ImagePolicy.getObservedPreviousImage", () => {
  test("formats the previous ref", () => {
    const object = withStatus({
      observedPreviousRef: { name: "ghcr.io/stefanprodan/podinfo", tag: "6.14.0" },
      observedPreviousImage: "ghcr.io/stefanprodan/podinfo:6.13.0",
    });
    expect(ImagePolicy.getObservedPreviousImage(object)).toBe("ghcr.io/stefanprodan/podinfo:6.14.0");
  });

  test("falls back to the previous image", () => {
    const object = withStatus({ observedPreviousImage: "ghcr.io/stefanprodan/podinfo:6.13.0" });
    expect(ImagePolicy.getObservedPreviousImage(object)).toBe("ghcr.io/stefanprodan/podinfo:6.13.0");
  });

  test("returns undefined without either field", () => {
    expect(ImagePolicy.getObservedPreviousImage(withStatus({}))).toBeUndefined();
  });
});
