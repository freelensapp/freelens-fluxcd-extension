import { describe, expect, test } from "vitest";
import { ImagePolicy } from "./imagepolicy-v1";

import type { ImagePolicyStatus } from "./imagepolicy-v1";

const withStatus = (status?: ImagePolicyStatus) => ({ status }) as unknown as ImagePolicy;

describe("ImagePolicy.getImage", () => {
  test("returns undefined when there is no ref", () => {
    expect(ImagePolicy.getImage(undefined)).toBeUndefined();
  });

  test("joins the name and the tag", () => {
    expect(ImagePolicy.getImage({ name: "ghcr.io/stefanprodan/podinfo", tag: "6.15.0" })).toBe(
      "ghcr.io/stefanprodan/podinfo:6.15.0",
    );
  });

  test("appends the digest when set", () => {
    expect(ImagePolicy.getImage({ name: "ghcr.io/stefanprodan/podinfo", tag: "6.15.0", digest: "sha256:abc" })).toBe(
      "ghcr.io/stefanprodan/podinfo:6.15.0@sha256:abc",
    );
  });
});

describe("ImagePolicy.getLatestTag", () => {
  test("returns undefined without a status or a latest ref", () => {
    expect(ImagePolicy.getLatestTag(withStatus(undefined))).toBeUndefined();
    expect(ImagePolicy.getLatestTag(withStatus({}))).toBeUndefined();
  });

  test("reads the tag of the latest ref", () => {
    const object = withStatus({ latestRef: { name: "ghcr.io/stefanprodan/podinfo", tag: "6.15.0" } });
    expect(ImagePolicy.getLatestTag(object)).toBe("6.15.0");
  });
});

describe("ImagePolicy.getLatestImage and getObservedPreviousImage", () => {
  test("format the latest and the previous ref", () => {
    const object = withStatus({
      latestRef: { name: "ghcr.io/stefanprodan/podinfo", tag: "6.15.0", digest: "sha256:abc" },
      observedPreviousRef: { name: "ghcr.io/stefanprodan/podinfo", tag: "6.14.0" },
    });
    expect(ImagePolicy.getLatestImage(object)).toBe("ghcr.io/stefanprodan/podinfo:6.15.0@sha256:abc");
    expect(ImagePolicy.getObservedPreviousImage(object)).toBe("ghcr.io/stefanprodan/podinfo:6.14.0");
  });

  test("return undefined without the refs", () => {
    expect(ImagePolicy.getLatestImage(withStatus({}))).toBeUndefined();
    expect(ImagePolicy.getObservedPreviousImage(withStatus({}))).toBeUndefined();
  });
});
