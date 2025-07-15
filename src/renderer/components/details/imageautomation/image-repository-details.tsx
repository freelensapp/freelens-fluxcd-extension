import { Renderer } from "@freelensapp/extensions";
import React from "react";
import { ImageRepository } from "../../../k8s/fluxcd/image/imagerepository";

const {
  Component: { DrawerItem },
} = Renderer;

export class FluxCDImageRepositoryDetails extends React.Component<
  Renderer.Component.KubeObjectDetailsProps<ImageRepository>
> {
  render() {
    const { object } = this.props;

    return (
      <div>
        <DrawerItem name="Provider">{object.spec.provider}</DrawerItem>
        <DrawerItem name="Image">{object.spec.image}</DrawerItem>
        <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
        <DrawerItem name="Suspended">{object.spec.suspend === true ? "Yes" : "No"}</DrawerItem>
      </div>
    );
  }
}
