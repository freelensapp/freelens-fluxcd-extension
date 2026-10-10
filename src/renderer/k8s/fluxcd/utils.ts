import { Renderer } from "@freelensapp/extensions";

import type { NamespacedObjectKindReference } from "./types";

type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

export function getRefUrl(
  ref: LocalObjectReference | NamespacedObjectKindReference,
  parentObject?: Renderer.K8sApi.KubeObject,
) {
  if (!ref) return;
  return Renderer.K8sApi.apiManager.lookupApiLink(ref, parentObject);
}
