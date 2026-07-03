import { describe, expect, test } from "vitest";
import { GitRepository } from "./gitrepository-v1";

import type { GitRepositoryRef } from "./gitrepository-v1";

describe("GitRepository.getGitRef", () => {
  test("returns undefined when there is no ref", () => {
    expect(GitRepository.getGitRef(undefined)).toBeUndefined();
  });

  test("strips the refs/heads/ prefix from a name", () => {
    expect(GitRepository.getGitRef({ name: "refs/heads/main" })).toBe("main");
  });

  test("strips the refs/tags/ prefix from a name", () => {
    expect(GitRepository.getGitRef({ name: "refs/tags/v1.0.0" })).toBe("v1.0.0");
  });

  test("prefers name over the other fields", () => {
    expect(GitRepository.getGitRef({ name: "custom", branch: "main", tag: "v1" })).toBe("custom");
  });

  test.each<[keyof GitRepositoryRef, string]>([
    ["branch", "main"],
    ["tag", "v1.2.3"],
    ["semver", ">=1.0.0"],
    ["commit", "abcdef"],
  ])("falls back to %s when no name is set", (field, value) => {
    expect(GitRepository.getGitRef({ [field]: value })).toBe(value);
  });
});

describe("GitRepository.getGitRefFull", () => {
  test("returns undefined for an empty or missing ref", () => {
    expect(GitRepository.getGitRefFull(undefined)).toBeUndefined();
    expect(GitRepository.getGitRefFull({})).toBeUndefined();
  });

  test.each<[keyof GitRepositoryRef, string, string]>([
    ["name", "refs/heads/main", "name: refs/heads/main"],
    ["branch", "main", "branch: main"],
    ["tag", "v1", "tag: v1"],
    ["semver", ">=1.0.0", "semver: >=1.0.0"],
    ["commit", "abcdef", "commit: abcdef"],
  ])("labels the %s field", (field, value, expected) => {
    expect(GitRepository.getGitRefFull({ [field]: value })).toBe(expected);
  });

  test("prefers name over other fields", () => {
    expect(GitRepository.getGitRefFull({ name: "n", branch: "b" })).toBe("name: n");
  });
});

describe("GitRepository.getGitRevision", () => {
  test("returns undefined when there is no artifact revision", () => {
    expect(GitRepository.getGitRevision({ status: {} } as unknown as GitRepository)).toBeUndefined();
  });

  test("strips the refs/heads/ prefix from the revision", () => {
    const object = { status: { artifact: { revision: "refs/heads/main@sha1:abc" } } } as unknown as GitRepository;
    expect(GitRepository.getGitRevision(object)).toBe("main@sha1:abc");
  });

  test("leaves a revision without a refs prefix untouched", () => {
    const object = { status: { artifact: { revision: "main@sha1:abc" } } } as unknown as GitRepository;
    expect(GitRepository.getGitRevision(object)).toBe("main@sha1:abc");
  });
});
