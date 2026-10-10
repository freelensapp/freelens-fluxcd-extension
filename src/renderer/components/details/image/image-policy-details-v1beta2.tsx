import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import React from "react";
import { ImagePolicy } from "../../../k8s/fluxcd/image/imagepolicy-v1beta2";
import { withFluxKind } from "../../../k8s/fluxcd/utils";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, DrawerItem, LinkToObject },
} = Renderer;

export const ImagePolicyDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<ImagePolicy>> = observer(
  (props) => {
    const { object } = props;

    return (
      <>
        <div>
          <DrawerItem name="Resumed">
            <BadgeBoolean value={!object.spec.suspend} />
          </DrawerItem>
          <DrawerItem name="Image Repository">
            <LinkToObject objectRef={withFluxKind(object.spec.imageRepositoryRef, "ImageRepository")} object={object} />
          </DrawerItem>
          <DrawerItem name="SemVer Policy" hidden={!object.spec.policy.semver}>
            {object.spec.policy.semver?.range}
          </DrawerItem>
          <DrawerItem name="Alphabetical Policy" hidden={!object.spec.policy.alphabetical}>
            {object.spec.policy.alphabetical?.order ?? "asc"}
          </DrawerItem>
          <DrawerItem name="Numerical Policy" hidden={!object.spec.policy.numerical}>
            {object.spec.policy.numerical?.order ?? "asc"}
          </DrawerItem>
          <DrawerItem name="Filter Tags" hidden={!object.spec.filterTags}>
            <DrawerItem name="pattern">{object.spec.filterTags?.pattern}</DrawerItem>
            <DrawerItem name="extract">{object.spec.filterTags?.extract}</DrawerItem>
          </DrawerItem>
          <DrawerItem name="Digest Reflection Policy">{object.spec.digestReflectionPolicy ?? "Never"}</DrawerItem>
          <DrawerItem name="Interval" hidden={!object.spec.interval}>
            {object.spec.interval}
          </DrawerItem>
        </div>
      </>
    );
  },
);
