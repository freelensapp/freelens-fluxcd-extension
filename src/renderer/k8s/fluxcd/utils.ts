import { Renderer } from "@freelensapp/extensions";

import type { NamespacedObjectKindReference } from "./types";

export function getRefUrl(ref: NamespacedObjectKindReference, parentObject?: Renderer.K8sApi.KubeObject) {
  if (!ref) return;
  return Renderer.K8sApi.apiManager.lookupApiLink(ref, parentObject);
}
