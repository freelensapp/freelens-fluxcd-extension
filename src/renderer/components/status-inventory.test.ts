import { describe, expect, test } from "vitest";
import { inventoryResourceRefToObjectRef } from "./status-inventory";

describe("inventoryResourceRefToObjectRef", () => {
  test("gives an entry of the core group the version alone as apiVersion", () => {
    expect(inventoryResourceRefToObjectRef({ id: "podinfo-kustomize_podinfo__Service", v: "v1" })).toEqual({
      apiVersion: "v1",
      kind: "Service",
      name: "podinfo",
      namespace: "podinfo-kustomize",
    });
  });

  test("gives an entry of a named group the group and version as apiVersion", () => {
    expect(inventoryResourceRefToObjectRef({ id: "podinfo-kustomize_podinfo_apps_Deployment", v: "v1" })).toEqual({
      apiVersion: "apps/v1",
      kind: "Deployment",
      name: "podinfo",
      namespace: "podinfo-kustomize",
    });
  });
});
