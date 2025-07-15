import { Common, Renderer } from "@freelensapp/extensions";

import type { FluxCDKubeObjectSpecSuspend } from "../k8s/fluxcd/types";

const {
  Component: { MenuItem, Icon },
} = Renderer;

type FluxCDKubeObjectWithMetadata = Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  unknown
>;
type FluxCDKubeObjectWithMetadataCtor = typeof Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  unknown
>;

export interface FluxCDObjectReconcileMenuItemProps
  extends Common.Types.KubeObjectMenuItemProps<Renderer.K8sApi.KubeObject<any, any, FluxCDKubeObjectSpecSuspend>> {
  resource: FluxCDKubeObjectWithMetadataCtor;
}

export function FluxCDObjectReconcileMenuItem(props: FluxCDObjectReconcileMenuItemProps) {
  const { object, toolbar, resource } = props;
  if (!object) return <></>;

  const store = resource.getStore<FluxCDKubeObjectWithMetadata>();
  if (!store) return <></>;

  const reconcile = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "reconcile.fluxcd.io/requestedAt": new Date().toISOString() },
        },
      },
      "merge",
    );
  };

  return (
    <MenuItem onClick={reconcile} disabled={object.spec.suspend === true}>
      <Icon material="autorenew" interactive={toolbar} title="Reconcile" />
      <span className="title">Reconcile</span>
    </MenuItem>
  );
}
