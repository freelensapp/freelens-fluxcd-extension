import type { NamespacedObjectKindReference } from "../k8s/fluxcd/types";

interface ObjectRefTooltipProps {
  objectRef: NamespacedObjectKindReference;
}

export function ObjectRefTooltip({ objectRef }: ObjectRefTooltipProps) {
  return (
    <span>
      <b>apiVersion:</b>&nbsp;{objectRef.apiVersion}
      <br />
      <b>kind:</b>&nbsp;{objectRef.kind}
    </span>
  );
}
