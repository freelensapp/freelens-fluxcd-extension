import { describe, expect, test } from "vitest";
import { ImageRepository } from "./imagerepository-v1";

describe("ImageRepository", () => {
  // The `+kubebuilder:resource:shortName` marker of `ImageRepository` in image-reflector-controller api/v1.
  test("has the short names of the CRD", () => {
    expect(ImageRepository.crd.shortNames).toEqual(["imgrepo", "imagerepo"]);
  });
});
