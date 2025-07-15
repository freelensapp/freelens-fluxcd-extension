import { Renderer } from "@freelensapp/extensions";

import type { DumpOptions } from "js-yaml";

type KubeObject = Renderer.K8sApi.KubeObject<any, any, any>;

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

export function getStatusClass<T extends KubeObject>(obj: T) {
  const status = getStatus(obj);
  switch (status) {
    case "ready":
      return "success";
    case "not-ready":
      return "error";
    case "suspended":
      return "info";
    case "in-progress":
      return "warning";
    default:
      return "";
  }
}

export function getStatusText<T extends KubeObject>(obj: T): string {
  const status = getStatus(obj);
  switch (status) {
    case "ready":
      return "Ready";
    case "not-ready":
      return "Not Ready";
    case "suspended":
      return "Suspended";
    case "in-progress":
      return "In Progress";
    default:
      return "Unknown";
  }
}

export function getStatusMessage<T extends KubeObject>(object: T): string {
  return object.status?.conditions?.find((c) => c.type === "Ready")?.message || "unknown";
}

function getStatus<T extends KubeObject>(object: T): string {
  if (object.spec?.suspend) return "suspended";

  const readyCondition = object.status?.conditions?.find((c) => c.type === "Ready");

  if (readyCondition?.status === "True") return "ready";
  if (readyCondition?.status === "False") return "not-ready";
  if (object.status?.conditions) return "in-progress";

  return "";
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
