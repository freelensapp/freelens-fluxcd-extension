import { Renderer } from "@freelensapp/extensions";
import React from "react";
import { GitRepository } from "../../../k8s/fluxcd/source/gitrepository";
import { getConditionClass, getConditionText } from "../../../utils";

const {
  Component: { Badge, BadgeBoolean, DrawerItem },
} = Renderer;

export const GitRepositoryDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<GitRepository>> = (props) => {
  const { object } = props;

  return (
    <div>
      <DrawerItem name="Condition">
        <Badge className={getConditionClass(object)} label={getConditionText(object)} />
      </DrawerItem>
      <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
      <DrawerItem name="Timeout">{object.spec.timeout}</DrawerItem>
      <DrawerItem name="Target Ref">{GitRepository.getGitRef(object.spec.ref) ?? "N/A"}</DrawerItem>
      <DrawerItem name="Revision">{GitRepository.getGitRevision(object) || "N/A"}</DrawerItem>
      <DrawerItem name="Suspended">
        <BadgeBoolean value={object.spec.suspend ?? false} />
      </DrawerItem>
    </div>
  );
};
