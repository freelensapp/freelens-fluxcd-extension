import { Common, Renderer } from "@freelensapp/extensions";
import { getRefUrl } from "../k8s/fluxcd/utils";
import { getMaybeDetailsUrl } from "../utils";

import type { KubeObject, LocalObjectReference } from "@freelensapp/kube-object";

import type { NamespacedObjectKindReference } from "../k8s/fluxcd/types";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { MaybeLink, WithTooltip },
} = Renderer;

interface LinkToObjectProps {
  objectRef?: LocalObjectReference | NamespacedObjectKindReference;
  object?: KubeObject;
  tooltip?: string | React.ReactNode;
  content?: string | React.ReactNode;
}

export function LinkToObject({ objectRef, object, tooltip, content }: LinkToObjectProps) {
  if (!objectRef || !object) return null;
  return (
    <MaybeLink to={getMaybeDetailsUrl(getRefUrl(objectRef, object))} onClick={stopPropagation}>
      <WithTooltip tooltip={tooltip}>{content ?? objectRef?.name}</WithTooltip>
    </MaybeLink>
  );
}
