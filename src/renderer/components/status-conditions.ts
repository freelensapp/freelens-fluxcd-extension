import moment from "moment";

import type { Condition } from "@freelensapp/kube-object";

function timeToUnix(dateStr?: string): number {
  const m = moment(dateStr, moment.ISO_8601, true);
  return m.isValid() ? m.unix() : 0;
}

const conditionTypePrioritiesDefault = {
  PodScheduled: 1,
  PodReadyToStartContainers: 2,
  ContainersReady: 3,
  ArtifactInStorage: 3,
  Released: 3,
  Initialized: 4,
  Synced: 4,
  Ready: 5,
};

/**
 * Sort conditions (the newer first) using heuristic: first sorts fields by
 * date and if the date is the same then checks priority from the object.
 */
export function sortConditions(
  conditions: Condition[],
  conditionTypePriorities: Record<string, number> = conditionTypePrioritiesDefault,
): Condition[] | undefined {
  return conditions?.sort(
    (a, b) =>
      timeToUnix(b.lastTransitionTime) - timeToUnix(a.lastTransitionTime) ||
      (conditionTypePriorities[b.type] ?? 0) - (conditionTypePriorities[a.type] ?? 0),
  );
}

export function getLastCondition(conditions: Condition[]): Condition | undefined {
  return (sortConditions(conditions) ?? [])[0];
}

export function getConditionText(conditions?: Condition[]) {
  if (!conditions || !conditions.length) return "Unknown";
  const condition = getLastCondition(conditions);
  if ("suspend" in conditions && conditions.suspend) return "Suspended";
  if (condition?.type === "Ready" && condition?.status === "True") return "Ready";
  if (condition?.status === "False") return "Not Ready";
  if (condition?.type == "Stalled") return "Stalled";
  if (conditions) return "In Progress";
  return "Unknown";
}

export function getStatusMessage(conditions?: Condition[]) {
  if (!conditions || !conditions.length) return;
  return getLastCondition(conditions)?.message;
}

/**
 * Returns a CSS class name that is defined in the main application.
 */
export function getConditionClass(conditions?: Condition[]) {
  const status = getConditionText(conditions);
  switch (status) {
    case "In Progress":
      return "warning";
    case "Not Ready":
      return "error";
    case "Ready":
      return "success";
    case "Suspended":
      return "info";
    default:
      return "";
  }
}
