import { Renderer } from "@freelensapp/extensions";
import moment from "moment";

import type { Condition } from "@freelensapp/kube-object";

import type { DumpOptions } from "js-yaml";

import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatusWithConditions } from "./k8s/fluxcd/types";

type KubeObjectWithCondition = Renderer.K8sApi.KubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  FluxCDKubeObjectStatusWithConditions,
  {} | FluxCDKubeObjectSpecWithSuspend
>;

const {
  Navigation: { getDetailsUrl },
} = Renderer;

// TODO: Use API 1.5
export function lowerAndPluralize(str: string) {
  const lowerStr = str.toLowerCase();

  if (lowerStr.endsWith("y")) {
    return lowerStr.replace(/y$/, "ies");
  } else if (
    lowerStr.endsWith("s") ||
    lowerStr.endsWith("x") ||
    lowerStr.endsWith("z") ||
    lowerStr.endsWith("ch") ||
    lowerStr.endsWith("sh")
  ) {
    return lowerStr + "es";
  } else {
    return lowerStr + "s";
  }
}

export function getMaybeDetailsUrl(url?: string): string {
  if (url) {
    return getDetailsUrl(url);
  } else {
    return "";
  }
}

function timeToUnix(dateStr?: string): number {
  const m = moment(dateStr);
  return m.isValid() ? m.unix() : 0;
}

export function getLastCondition<T extends KubeObjectWithCondition>(object: T): Condition | undefined {
  return (object.status?.conditions?.sort(
    (a, b) => timeToUnix(a.lastTransitionTime) - timeToUnix(b.lastTransitionTime),
  ) ?? [])[0];
}

export function getStatusText<T extends KubeObjectWithCondition>(object: T) {
  const condition = getLastCondition(object);
  if ("suspend" in object.spec && object.spec.suspend) return "Suspended";
  if (condition?.status === "True") return "Ready";
  if (condition?.status === "False") return "Not Ready";
  if (object.status?.conditions) return "In Progress";
  return "Unknown";
}

export function getStatusMessage<T extends KubeObjectWithCondition>(object: T) {
  return getLastCondition(object)?.message ?? "-";
}

export function getStatusClass<T extends KubeObjectWithCondition>(obj: T) {
  const status = getStatusText(obj);
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

export function getHeight(data?: string): number {
  const lineHeight = 18;
  if (!data) return lineHeight;

  const lines = data.split("\n").length;
  if (lines < 5) return 5 * lineHeight;
  if (lines > 20) return 20 * lineHeight;
  return lines * lineHeight;
}

export const defaultYamlDumpOptions: DumpOptions = {
  noArrayIndent: true,
  noCompatMode: true,
  noRefs: true,
  quotingType: '"',
  sortKeys: true,
};
