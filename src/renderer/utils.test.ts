import { Renderer } from "@freelensapp/extensions";
import { afterEach, describe, expect, test, vi } from "vitest";
import { createEnumFromKeys, getHeight, getServedStore } from "./utils";

// The stub's `getStore()` throws, as the host's does for a version that is not
// served. A test marks a version as served by spying on `getStore` of its class.
class KindV1 extends Renderer.K8sApi.LensExtensionKubeObject {}
class KindV1beta2 extends Renderer.K8sApi.LensExtensionKubeObject {}
class KindV1beta1 extends Renderer.K8sApi.LensExtensionKubeObject {}

function serve(kubeObjectClass: typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>) {
  const store = {} as Renderer.K8sApi.KubeObjectStore<any, any, any>;
  vi.spyOn(kubeObjectClass, "getStore").mockReturnValue(store);
  return store;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getServedStore", () => {
  test("returns the store of the first served version only", () => {
    const store = serve(KindV1);
    serve(KindV1beta2);

    expect(getServedStore([KindV1, KindV1beta2, KindV1beta1])).toBe(store);
    expect(KindV1beta2.getStore).not.toHaveBeenCalled();
  });

  test("falls back to an older version when the newer ones are not served", () => {
    const store = serve(KindV1beta1);

    expect(getServedStore([KindV1, KindV1beta2, KindV1beta1])).toBe(store);
  });

  test("returns undefined when no version is served", () => {
    expect(getServedStore([KindV1, KindV1beta2, KindV1beta1])).toBeUndefined();
  });
});

describe("getHeight", () => {
  test("returns a single line height when there is no data", () => {
    expect(getHeight()).toBe(18);
    expect(getHeight("")).toBe(18);
  });

  test("clamps short content to a minimum of five lines", () => {
    expect(getHeight("one\ntwo")).toBe(5 * 18);
  });

  test("scales with the number of lines between the bounds", () => {
    const data = Array.from({ length: 10 }, (_, i) => `line ${i}`).join("\n");
    expect(getHeight(data)).toBe(10 * 18);
  });

  test("clamps long content to a maximum of twenty lines", () => {
    const data = Array.from({ length: 50 }, (_, i) => `line ${i}`).join("\n");
    expect(getHeight(data)).toBe(20 * 18);
  });
});

describe("createEnumFromKeys", () => {
  test("maps each key to itself", () => {
    expect(createEnumFromKeys({ foo: 1, bar: "x" })).toEqual({ foo: "foo", bar: "bar" });
  });

  test("returns an empty object for an empty input", () => {
    expect(createEnumFromKeys({})).toEqual({});
  });
});
