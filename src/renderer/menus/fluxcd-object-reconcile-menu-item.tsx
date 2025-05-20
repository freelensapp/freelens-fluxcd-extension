import { Renderer } from "@freelensapp/extensions";

// @ts-ignore
import React from "react";

const {
  Component: { MenuItem, Icon },
} = Renderer;

interface FluxCustomSpec {
  suspend: boolean;
}

export interface FluxcdObjectReconcileMenuItemProps
  extends Renderer.Component.KubeObjectMenuProps<
    Renderer.K8sApi.KubeObject<Renderer.K8sApi.KubeObjectMetadata, any, FluxCustomSpec | any>
  > {
  api: Renderer.K8sApi.KubeApi<
    Renderer.K8sApi.KubeObject<Renderer.K8sApi.KubeObjectMetadata, any, FluxCustomSpec | any>
  >;
}

export function FluxcdObjectReconcileMenuItem(props: FluxcdObjectReconcileMenuItemProps) {
  const { object, toolbar, api } = props;
  if (!object) return null;

  const reconcile = async () => {
    if (!object.metadata.annotations) {
      object.metadata.annotations = {};
    }

    object.metadata.annotations["reconcile.fluxcd.io/requestedAt"] = new Date().toISOString();
    await api.update({ name: object.metadata.name, namespace: object.metadata.namespace }, object);
  };

  return (
    <MenuItem onClick={reconcile} disabled={object.spec.suspend === true}>
      <Icon material="autorenew" interactive={toolbar} title="Reconcile" />
      <span className="title">Reconcile</span>
    </MenuItem>
  );
}
