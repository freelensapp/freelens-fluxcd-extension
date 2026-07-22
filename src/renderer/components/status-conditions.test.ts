import { describe, expect, test } from "vitest";
import {
  getConditionClass,
  getConditionText,
  getLastCondition,
  getLastUpdated,
  getStatusMessage,
  sortConditions,
} from "./status-conditions";

import type { Condition } from "@freelensapp/kube-object";

function condition(overrides: Partial<Condition> = {}): Condition {
  return {
    type: "Ready",
    status: "True",
    lastTransitionTime: "2024-01-01T00:00:00Z",
    ...overrides,
  } as Condition;
}

describe("sortConditions", () => {
  test("sorts the newest transition time first", () => {
    const older = condition({ type: "Initialized", lastTransitionTime: "2024-01-01T00:00:00Z" });
    const newer = condition({ type: "Ready", lastTransitionTime: "2024-01-02T00:00:00Z" });
    expect(sortConditions([older, newer])?.map((c) => c.type)).toEqual(["Ready", "Initialized"]);
  });

  test("breaks ties on equal timestamps using the default type priority", () => {
    const time = "2024-01-01T00:00:00Z";
    const ready = condition({ type: "Ready", lastTransitionTime: time });
    const synced = condition({ type: "Synced", lastTransitionTime: time });
    // Ready (5) has a higher priority than Synced (4), so it comes first.
    expect(sortConditions([synced, ready])?.map((c) => c.type)).toEqual(["Ready", "Synced"]);
  });

  test("treats invalid or missing timestamps as epoch 0", () => {
    const withTime = condition({ type: "Ready", lastTransitionTime: "2024-01-01T00:00:00Z" });
    const withoutTime = condition({ type: "Initialized", lastTransitionTime: undefined });
    expect(sortConditions([withoutTime, withTime])?.[0].type).toBe("Ready");
  });

  test("honours a custom priority map on ties", () => {
    const time = "2024-01-01T00:00:00Z";
    const a = condition({ type: "A", lastTransitionTime: time });
    const b = condition({ type: "B", lastTransitionTime: time });
    expect(sortConditions([a, b], { A: 1, B: 2 })?.map((c) => c.type)).toEqual(["B", "A"]);
  });
});

describe("getLastCondition", () => {
  test("returns the newest condition", () => {
    const older = condition({ type: "Initialized", lastTransitionTime: "2024-01-01T00:00:00Z" });
    const newer = condition({ type: "Ready", lastTransitionTime: "2024-01-02T00:00:00Z" });
    expect(getLastCondition([older, newer])?.type).toBe("Ready");
  });

  test("returns undefined for an empty list", () => {
    expect(getLastCondition([])).toBeUndefined();
  });
});

describe("getConditionText", () => {
  test("returns Unknown for missing or empty conditions", () => {
    expect(getConditionText()).toBe("Unknown");
    expect(getConditionText([])).toBe("Unknown");
  });

  test("returns Ready when the latest condition is Ready/True", () => {
    expect(getConditionText([condition({ type: "Ready", status: "True" })])).toBe("Ready");
  });

  test("returns Not Ready when the latest condition status is False", () => {
    expect(getConditionText([condition({ type: "Ready", status: "False" })])).toBe("Not Ready");
  });

  test("returns Stalled when the latest condition type is Stalled", () => {
    expect(getConditionText([condition({ type: "Stalled", status: "Unknown" })])).toBe("Stalled");
  });

  test("returns In Progress for a non-terminal, non-Ready condition", () => {
    expect(getConditionText([condition({ type: "Reconciling", status: "Unknown" })])).toBe("In Progress");
  });

  test("returns Ready when Ready/True even if a newer condition is False (drift detection)", () => {
    const ready = condition({ type: "Ready", status: "True", lastTransitionTime: "2024-01-01T00:00:00Z" });
    const drift = condition({ type: "Released", status: "False", lastTransitionTime: "2024-01-02T00:00:00Z" });
    expect(getConditionText([ready, drift])).toBe("Ready");
  });
});

describe("getStatusMessage", () => {
  test("returns the message of the newest condition", () => {
    const older = condition({ type: "Initialized", lastTransitionTime: "2024-01-01T00:00:00Z", message: "old" });
    const newer = condition({ type: "Ready", lastTransitionTime: "2024-01-02T00:00:00Z", message: "new" });
    expect(getStatusMessage([older, newer])).toBe("new");
  });

  test("returns undefined for missing or empty conditions", () => {
    expect(getStatusMessage()).toBeUndefined();
    expect(getStatusMessage([])).toBeUndefined();
  });
});

describe("getConditionClass", () => {
  test.each([
    ["True", "Ready", "success"],
    ["False", "Ready", "error"],
    ["Unknown", "Reconciling", "warning"],
  ])("maps status %s / type %s to the %s class", (status, type, expected) => {
    expect(getConditionClass([condition({ type, status } as Partial<Condition>)])).toBe(expected);
  });

  test("returns an empty class for unknown status", () => {
    expect(getConditionClass()).toBe("");
    expect(getConditionClass([])).toBe("");
  });
});

describe("getLastUpdated", () => {
  test("returns the transition time of the newest condition", () => {
    const older = condition({ type: "Initialized", lastTransitionTime: "2024-01-01T00:00:00Z" });
    const newer = condition({ type: "Ready", lastTransitionTime: "2024-01-02T00:00:00Z" });
    expect(getLastUpdated([older, newer])).toBe("2024-01-02T00:00:00Z");
  });

  test("returns undefined for missing or empty conditions", () => {
    expect(getLastUpdated()).toBeUndefined();
    expect(getLastUpdated([])).toBeUndefined();
  });
});
