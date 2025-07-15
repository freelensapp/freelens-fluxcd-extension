import { Common, Renderer } from "@freelensapp/extensions";

import type { FluxCDObjectStatic, FluxCDSpecSuspend } from "../k8s/fluxcd/types";

const {
  Component: { MenuItem, Icon },
} = Renderer;

export interface FluxCDObjectReconcileMenuItemProps
  extends Common.Types.KubeObjectMenuItemProps<Renderer.K8sApi.KubeObject<any, any, FluxCDSpecSuspend>> {
  resource: FluxCDObjectStatic;
}

export function FluxCDObjectReconcileMenuItem(props: FluxCDObjectReconcileMenuItemProps) {
  const { object, toolbar, resource } = props;
  if (!object) return <></>;

  const store = resource.getStore() as Renderer.K8sApi.KubeObjectStore<Renderer.K8sApi.KubeObject & FluxCDSpecSuspend>;
  if (!store) return <></>;

  const reconcile = async () => {
    await store.patch(object, [
      {
        op: "add",
        path: "/metadata/annotations/reconcile.fluxcd.io~1requestedAt",
        value: new Date().toISOString(),
      },
    ]);
  };

  return (
    <MenuItem onClick={reconcile} disabled={object.spec.suspend === true}>
      <Icon material="autorenew" interactive={toolbar} title="Reconcile" />
      <span className="title">Reconcile</span>
    </MenuItem>
  );
}
