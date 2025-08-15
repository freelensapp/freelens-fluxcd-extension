import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { ImagePolicy } from "../../../k8s/fluxcd/image/imagepolicy";
import { getMaybeDetailsUrl } from "../../../utils";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { DrawerItem, MaybeLink },
} = Renderer;

export const ImagePolicyDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<ImagePolicy>> = observer(
  (props) => {
    const { object } = props;

    return (
      <>
        <div>
          <DrawerItem name="Image Repository">
            <MaybeLink
              key="link"
              to={getMaybeDetailsUrl(ImagePolicy.getImageRepositoryUrl(object))}
              onClick={stopPropagation}
            >
              {object.spec.imageRepositoryRef.name}
            </MaybeLink>
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
        </div>
      </>
    );
  },
);
