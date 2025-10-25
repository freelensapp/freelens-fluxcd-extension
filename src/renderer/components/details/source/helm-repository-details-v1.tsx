import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { HelmRepository } from "../../../k8s/fluxcd/source/helmrepository-v1";
import { LinkToSecret } from "../../link-to-secret";
import { StatusArtifact } from "../../status-artifact";

const {
  Component: { BadgeBoolean, DrawerItem },
} = Renderer;

export const HelmRepositoryDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<HelmRepository>> = observer(
  (props) => {
    const { object } = props;
    const namespace = object.getNs();

    return (
      <div>
        <DrawerItem name="Resumed">
          <BadgeBoolean value={!object.spec.suspend} />
        </DrawerItem>
        <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
        <DrawerItem name="Timeout">{object.spec.timeout ?? "60s"}</DrawerItem>
        <DrawerItem name="Authentication Credentials" hidden={!object.spec.secretRef}>
          <LinkToSecret name={object.spec.secretRef?.name} namespace={namespace} />
        </DrawerItem>
        <DrawerItem name="Pass Credentials" hidden={object.spec.passCredentials === undefined}>
          <BadgeBoolean value={object.spec.passCredentials} />
        </DrawerItem>

        <StatusArtifact artifact={object.status?.artifact} />
      </div>
    );
  },
);
