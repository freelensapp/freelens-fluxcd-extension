// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { BadgeSuspended } from "./badge-suspended";

afterEach(() => {
  cleanup();
});

// The classes are those of the stub's `getBooleanClass`: the host's are the CSS module classes `true` (success),
// `false` (error) and `undefined` (info) of `BadgeBoolean`.
describe("BadgeSuspended", () => {
  it("shows a suspended object as True, in the color of False", () => {
    render(<BadgeSuspended value={true} />);

    expect(screen.getByText("True").className).toBe("false");
  });

  it("shows an object that is not suspended as False, in the color of True", () => {
    render(<BadgeSuspended value={false} />);

    expect(screen.getByText("False").className).toBe("true");
  });

  it("shows no value as -, in the color of no value", () => {
    render(<BadgeSuspended />);

    expect(screen.getByText("-").className).toBe("undefined");
  });
});
