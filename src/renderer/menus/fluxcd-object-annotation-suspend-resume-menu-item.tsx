import { type Common, Renderer } from "@freelensapp/extensions";
import { isReconcileDisabled } from "../k8s/fluxcd/utils";

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
  extends Common.Types.KubeObjectMenuItemProps<FluxCDKubeObjectWithMetadata> {
  resource: FluxCDKubeObjectWithMetadataCtor;
  /**
   * The annotation that disables the reconciliation of the object with the value `disabled` and enables it with
   * `enabled`: `fluxcd.controlplane.io/reconcile` for the Flux Operator kinds, `source.extensions.fluxcd.io/reconcile`
   * for an ArtifactGenerator.
   */
  annotation: string;
}

export function FluxCDObjectAnnotationSuspendResumeMenuItem(props: FluxCDObjectAnnotationSuspendResumeMenuItemProps) {
  const { object, toolbar, resource, annotation } = props;
  if (!object) return <></>;

  const store = resource.getStore<FluxCDKubeObjectWithMetadata>();
  if (!store) return <></>;

  const suspend = async () => {
    await store.patch(
      object,
      {
        metadata: {
          annotations: { [annotation]: "disabled" },
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
          annotations: { [annotation]: "enabled" },
        },
      },
      "merge",
    );
  };

  if (!isReconcileDisabled(object, annotation)) {
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
