import { Renderer } from "@freelensapp/extensions";

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

export interface FluxCDObjectAnnotationSuspendResumeMenuItemProps
  extends Renderer.Component.KubeObjectMenuProps<FluxCDKubeObjectWithMetadata> {
  resource: FluxCDKubeObjectWithMetadataCtor;
}

export function FluxCDObjectAnnotationSuspendResumeMenuItem(props: FluxCDObjectAnnotationSuspendResumeMenuItemProps) {
  const { object, toolbar, resource } = props;
  if (!object) return <></>;

  const store = resource.getStore<FluxCDKubeObjectWithMetadata>();
  if (!store) return <></>;

  const suspend = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "fluxcd.controlplane.io/reconcile": "disabled" },
        },
      },
      "merge",
    );
  };

  const resume = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { "fluxcd.controlplane.io/reconcile": "enabled" },
        },
      },
      "merge",
    );
  };

  if ((object.metadata.annotations?.["fluxcd.controlplane.io/reconcile"] ?? "enabled") === "enabled") {
    return (
      <MenuItem onClick={suspend}>
        <Icon material="pause_circle_filled" interactive={toolbar} title="Suspend" />
        <span className="title">Suspend</span>
      </MenuItem>
    );
  } else {
    return (
      <MenuItem onClick={resume}>
        <Icon material="play_circle_outline" interactive={toolbar} title="Resume" />
        <span className="title">Resume</span>
      </MenuItem>
    );
  }
}
