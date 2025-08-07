import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import moment from "moment";
import styles from "./status-conditions.module.scss";
import stylesInline from "./status-conditions.module.scss?inline";

import type { Condition } from "@freelensapp/kube-object";

const {
  Component: { DrawerTitle, DrawerItem, Icon },
} = Renderer;

function timeToUnix(dateStr?: string): number {
  const m = moment(dateStr);
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
  if (condition?.status === "True") return "Ready";
  if (condition?.status === "False") return "Not Ready";
  if (conditions) return "In Progress";
  return "Unknown";
}

export function getConditionMessage(conditions?: Condition[]) {
  if (!conditions || !conditions.length) return;
  return getLastCondition(conditions)?.message;
}

/**
 * Returns a CSS class name that is defined in the main application.
 */
export function getConditionClass(conditions?: Condition[]) {
  const status = getConditionText(conditions);
  switch (status) {
    case "Ready":
      return "success";
    case "Not Ready":
      return "error";
    case "Suspended":
      return "info";
    case "In Progress":
      return "warning";
    default:
      return "";
  }
}

export interface StatusConditionsProps {
  conditions?: Condition[];
}

export const StatusConditions: React.FC<StatusConditionsProps> = observer((props) => {
  const { conditions } = props;

  if (!conditions) return null;

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.conditions}>
        <DrawerTitle>Conditions</DrawerTitle>
        {sortConditions(conditions)?.map((condition, idx) => (
          <div key={idx}>
            <div className={styles.title}>
              <Icon small material="list" />
            </div>
            <DrawerItem name="Last Transition Time">{condition.lastTransitionTime}</DrawerItem>
            <DrawerItem name="Reason">{condition.reason}</DrawerItem>
            <DrawerItem name="Status">{condition.status}</DrawerItem>
            <DrawerItem name="Type" hidden={!condition.type}>
              {condition.type}
            </DrawerItem>
            <DrawerItem name="Message">{condition.message}</DrawerItem>
          </div>
        ))}
      </div>
    </>
  );
});
