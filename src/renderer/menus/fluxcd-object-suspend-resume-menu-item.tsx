import { Renderer } from "@freelensapp/extensions";

import type { FluxCDObjectStatic, FluxCDSpecSuspend } from "../k8s/fluxcd/types";

const {
  Component: { MenuItem, Icon },
} = Renderer;

export interface FluxCDObjectSuspendResumeMenuItemProps
  extends Renderer.Component.KubeObjectMenuProps<
    Renderer.K8sApi.KubeObject<Renderer.K8sApi.KubeObjectMetadata, any, FluxCDSpecSuspend>
  > {
  resource: FluxCDObjectStatic;
}

export function FluxCDObjectSuspendResumeMenuItem(props: FluxCDObjectSuspendResumeMenuItemProps) {
  const { object, toolbar, resource } = props;
  if (!object) return <></>;

  const store = resource.getStore();
  if (!store) return <></>;

  const suspend = async () => {
    await store.patch(object, [
      {
        op: "add",
        path: "/spec/suspend",
        value: true,
      },
    ]);
  };

  const resume = async () => {
    await store.patch(object, [
      {
        op: "add",
        path: "/spec/suspend",
        value: false,
      },
    ]);
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
