import { Renderer } from "@freelensapp/extensions";

import type { LocalObjectReference } from "@freelensapp/kube-object";

import type { NamespacedObjectKindReference } from "./types";

export function getRefUrl(
  ref: LocalObjectReference | NamespacedObjectKindReference,
  parentObject?: Renderer.K8sApi.KubeObject,
) {
  if (!ref) return;
  return Renderer.K8sApi.apiManager.lookupApiLink(ref, parentObject);
}
