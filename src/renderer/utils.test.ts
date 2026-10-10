import { describe, expect, test } from "vitest";
import { createEnumFromKeys, getHeight } from "./utils";

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
