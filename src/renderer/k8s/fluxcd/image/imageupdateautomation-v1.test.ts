import { describe, expect, test } from "vitest";
import { ImageUpdateAutomation } from "./imageupdateautomation-v1";
import { ImageUpdateAutomation as ImageUpdateAutomation_v1beta1 } from "./imageupdateautomation-v1beta1";
import { ImageUpdateAutomation as ImageUpdateAutomation_v1beta2 } from "./imageupdateautomation-v1beta2";

// The helper of every version has the same code, so it runs for each of them. The objects are partial, and each
// version's helper takes its own model, so they are passed as `never`.
describe.each([
  { version: "v1", model: ImageUpdateAutomation },
  { version: "v1beta2", model: ImageUpdateAutomation_v1beta2 },
  { version: "v1beta1", model: ImageUpdateAutomation_v1beta1 },
])("ImageUpdateAutomation $version getCommitAuthor", ({ model }) => {
  const object = (git?: Record<string, unknown>) => ({ spec: { git } }) as never;

  test("formats the name and the email of the author as a Git author", () => {
    expect(model.getCommitAuthor(object({ commit: { author: { name: "Flux", email: "flux@example.com" } } }))).toBe(
      "Flux <flux@example.com>",
    );
  });

  test("shows the email alone for an author without a name", () => {
    expect(model.getCommitAuthor(object({ commit: { author: { email: "flux@example.com" } } }))).toBe(
      "flux@example.com",
    );
  });

  test("is undefined for an author without an email", () => {
    expect(model.getCommitAuthor(object({ commit: { author: { name: "Flux" } } }))).toBeUndefined();
  });

  // `git` is optional; `git.commit` and its `author` are required by every CRD.
  test("is undefined without a git spec", () => {
    expect(model.getCommitAuthor(object())).toBeUndefined();
  });
});
