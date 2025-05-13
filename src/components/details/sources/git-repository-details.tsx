import { Common, Renderer } from "@freelensapp/extensions";
import React from "react";
import { GitRepository } from "../../../k8s/fluxcd/sources/gitrepository";
import { getStatusClass, getStatusText } from "../../../utils";

const {
  Component: { DrawerItem, Badge },
} = Renderer;

export class FluxCDGitRepositoryDetails extends React.Component<
  Renderer.Component.KubeObjectDetailsProps<GitRepository>
> {
  getRef(object: GitRepository) {
    const ref = object.spec.ref;

    return ref.branch ?? ref.tag ?? ref.semver ?? ref.name ?? ref.commit;
  }

  render() {
    const { object } = this.props;

    return (
      <div>
        <DrawerItem name="Status">{object.status?.conditions.find((s: any) => s.type === "Ready").message}</DrawerItem>
        <DrawerItem name="Ready">
          <Badge className={getStatusClass(object)} label={getStatusText(object)} />
        </DrawerItem>
        <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
        <DrawerItem name="Timeout">{object.spec.timeout}</DrawerItem>
        <DrawerItem name="Target Ref">{this.getRef(object)}</DrawerItem>
        <DrawerItem name="Suspended">{object.spec.suspend === true ? "Yes" : "No"}</DrawerItem>
        <DrawerItem name="Url">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              Common.Util.openBrowser(object.spec.url);
            }}
          >
            {object.spec.url}
          </a>
        </DrawerItem>
      </div>
    );
  }
}
