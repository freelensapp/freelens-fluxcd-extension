import { type Common, Renderer } from "@freelensapp/extensions";

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

export interface FluxCDObjectReconcileMenuItemProps extends Common.Types.KubeObjectMenuItemProps {
  resource: FluxCDKubeObjectWithMetadataCtor;
}

function isSuspended(object: Renderer.K8sApi.KubeObject): boolean {
  const { spec } = object;
  return typeof spec === "object" && spec !== null && "suspend" in spec && spec.suspend === true;
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
    <MenuItem onClick={reconcile} disabled={isSuspended(object)}>
      <Icon material="autorenew" interactive={toolbar} title="Reconcile" />
      <span className="title">Reconcile</span>
    </MenuItem>
  );
}
