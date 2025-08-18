import { Renderer } from "@freelensapp/extensions";

import type { FluxCDKubeObjectSpecWithSuspend } from "../k8s/fluxcd/types";

const {
  Component: { MenuItem, Icon },
} = Renderer;

type FluxCDKubeObjectWithSuspend = Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  FluxCDKubeObjectSpecWithSuspend
>;
type FluxCDKubeObjectWithSuspendCtor = typeof Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  unknown,
  FluxCDKubeObjectSpecWithSuspend
>;

export interface FluxCDObjectSuspendResumeMenuItemProps
  extends Renderer.Component.KubeObjectMenuProps<FluxCDKubeObjectWithSuspend> {
  resource: FluxCDKubeObjectWithSuspendCtor;
}

export function FluxCDObjectSuspendResumeMenuItem(props: FluxCDObjectSuspendResumeMenuItemProps) {
  const { object, toolbar, resource } = props;
  if (!object) return <></>;

  const store = resource.getStore<FluxCDKubeObjectWithSuspend>();
  if (!store) return <></>;

  const suspend = async () => {
    await store.patch(
      object,
      {
        spec: {
          suspend: true,
        },
      },
      "merge",
    );
  };

  const resume = async () => {
    await store.patch(
      object,
      {
        spec: {
          suspend: false,
        },
      },
      "merge",
    );
  };

  if (object.spec.suspend === true) {
    return (
      <MenuItem onClick={resume}>
        <Icon material="play_circle_outline" interactive={toolbar} title="Resume" />
        <span className="title">Resume</span>
      </MenuItem>
    );
  }

  return (
    <MenuItem onClick={suspend}>
      <Icon material="pause_circle_filled" interactive={toolbar} title="Suspend" />
      <span className="title">Suspend</span>
    </MenuItem>
  );
}
