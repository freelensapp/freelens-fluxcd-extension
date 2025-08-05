import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import moment from "moment";
import styles from "./status-conditions.module.scss";
import stylesInline from "./status-conditions.module.scss?inline";

import type { Condition } from "@freelensapp/kube-object";

import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatusWithConditions } from "../k8s/fluxcd/types";

export type KubeObjectWithCondition = Renderer.K8sApi.KubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  FluxCDKubeObjectStatusWithConditions,
  {} | FluxCDKubeObjectSpecWithSuspend
>;

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
export function sortConditions<T extends KubeObjectWithCondition>(
  object: T,
  conditionTypePriorities: Record<string, number> = conditionTypePrioritiesDefault,
): Condition[] | undefined {
  return object.status?.conditions?.sort(
    (a, b) =>
      timeToUnix(b.lastTransitionTime) - timeToUnix(a.lastTransitionTime) ||
      (conditionTypePriorities[b.type] ?? 0) - (conditionTypePriorities[a.type] ?? 0),
  );
}

export function getLastCondition<T extends KubeObjectWithCondition>(object: T): Condition | undefined {
  return (sortConditions(object) ?? [])[0];
}

export function getConditionText<T extends KubeObjectWithCondition>(object: T) {
  const condition = getLastCondition(object);
  if ("suspend" in object.spec && object.spec.suspend) return "Suspended";
  if (condition?.status === "True") return "Ready";
  if (condition?.status === "False") return "Not Ready";
  if (object.status?.conditions) return "In Progress";
  return "Unknown";
}

export function getConditionMessage<T extends KubeObjectWithCondition>(object: T) {
  return getLastCondition(object)?.message ?? "-";
}

/**
 * Returns a CSS class name that is defined in the main application.
 */
export function getConditionClass<T extends KubeObjectWithCondition>(obj: T) {
  const status = getConditionText(obj);
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

export const StatusConditions: React.FC<Renderer.Component.KubeObjectDetailsProps<KubeObjectWithCondition>> = observer(
  (props) => {
    const { object } = props;

    if (!object.status?.conditions) return null;

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.conditions}>
          <DrawerTitle>Conditions</DrawerTitle>
          {sortConditions(object)?.map((condition, idx) => (
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
  },
);
