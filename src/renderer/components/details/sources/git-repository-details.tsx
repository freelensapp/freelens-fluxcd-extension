import { Renderer } from "@freelensapp/extensions";
import React from "react";
import { GitRepository, type GitRepositoryRef } from "../../../k8s/fluxcd/source/gitrepository";
import { getConditionClass, getConditionText } from "../../../utils";

const {
  Component: { Badge, BadgeBoolean, DrawerItem },
} = Renderer;

export function getGitRef(ref?: GitRepositoryRef): string | undefined {
  if (!ref) return;
  return ref.name?.replace(/^refs\/(heads|tags)\//, "") ?? ref.branch ?? ref.tag ?? ref.semver ?? ref.commit;
}

export function getGitRevision(object: GitRepository): string | undefined {
  return object.status?.artifact?.revision?.replace(/^refs\/(heads|tags)\//, "");
}

export const GitRepositoryDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<GitRepository>> = (props) => {
  const { object } = props;

  return (
    <div>
      <DrawerItem name="Condition">
        <Badge className={getConditionClass(object)} label={getConditionText(object)} />
      </DrawerItem>
      <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
      <DrawerItem name="Timeout">{object.spec.timeout}</DrawerItem>
      <DrawerItem name="Target Ref">{getGitRef(object.spec.ref) ?? "N/A"}</DrawerItem>
      <DrawerItem name="Revision">{object.status?.artifact?.revision || "N/A"}</DrawerItem>
      <DrawerItem name="Suspended">
        <BadgeBoolean value={object.spec.suspend ?? false} />
      </DrawerItem>
    </div>
  );
};
