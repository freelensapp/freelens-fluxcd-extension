import { Renderer } from "@freelensapp/extensions";

type Condition = Renderer.K8sApi.Condition;

const {
  Util: { isIso8601DateString },
} = Renderer;

function timeToUnix(dateStr?: string): number {
  if (!dateStr || !isIso8601DateString(dateStr)) return 0;
  const time = Date.parse(dateStr);
  return Number.isNaN(time) ? 0 : Math.floor(time / 1000);
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
 * Returns a sorted copy: the array is `status.conditions` of an object from
 * the host's store, which other views read in its own order.
 */
export function sortConditions(
  conditions: Condition[],
  conditionTypePriorities: Record<string, number> = conditionTypePrioritiesDefault,
): Condition[] | undefined {
  if (!conditions) return;
  return [...conditions].sort(
    (a, b) =>
      timeToUnix(b.lastTransitionTime) - timeToUnix(a.lastTransitionTime) ||
      (conditionTypePriorities[b.type] ?? 0) - (conditionTypePriorities[a.type] ?? 0),
  );
}

export function getLastCondition(conditions: Condition[]): Condition | undefined {
  return (sortConditions(conditions) ?? [])[0];
}

/**
 * Returns the overall status of an object. `suspend` is `spec.suspend` of
 * the object: a suspended object is reported as Suspended whatever its
 * conditions, as on the Overview chart.
 */
export function getConditionText(conditions?: Condition[], suspend?: boolean) {
  if (suspend) return "Suspended";
  if (!conditions || !conditions.length) return "Unknown";

  // A resource that is actively reconciling is not (yet) in its desired state.
  // Flux sets a Reconciling condition (status True) while a reconcile is in
  // progress, even when the Ready condition still reflects the previous
  // success. Report it as In Progress regardless of what the heuristic below
  // would otherwise conclude.
  if (conditions.some((condition) => condition.type === "Reconciling" && condition.status === "True")) {
    return "In Progress";
  }

  // The Ready condition is the canonical overall status for FluxCD resources
  // (kstatus / flux CLI). Prefer it over the newest condition; otherwise an
  // unrelated newer condition (e.g. from drift detection) with status False
  // would incorrectly mark a Ready resource as Not Ready.
  const readyCondition = conditions.find((condition) => condition.type === "Ready");
  if (readyCondition) {
    if (readyCondition.status === "True") return "Ready";
    if (conditions.some((condition) => condition.type === "Stalled" && condition.status === "True")) return "Stalled";
    if (readyCondition.status === "False") return "Not Ready";
    return "In Progress";
  }

  // No Ready condition yet: fall back to the newest-condition heuristic.
  const condition = getLastCondition(conditions);
  if (condition?.status === "False") return "Not Ready";
  if (condition?.type === "Stalled") return "Stalled";
  return "In Progress";
}

export function getStatusMessage(conditions?: Condition[]) {
  if (!conditions || !conditions.length) return;
  return getLastCondition(conditions)?.message;
}

/**
 * Returns a CSS class name that is defined in the main application.
 */
export function getConditionClass(conditions?: Condition[], suspend?: boolean) {
  const status = getConditionText(conditions, suspend);
  switch (status) {
    case "In Progress":
      return "warning";
    case "Not Ready":
    case "Stalled":
      return "error";
    case "Ready":
      return "success";
    case "Suspended":
      return "info";
    default:
      return "";
  }
}

export function getLastUpdated(conditions?: Condition[]) {
  if (!conditions || !conditions.length) return;
  return getLastCondition(conditions)?.lastTransitionTime;
}
