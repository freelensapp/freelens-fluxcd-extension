import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { HelmRepository } from "../../../k8s/fluxcd/source/helmrepository";
import { getMaybeDetailsUrl } from "../../../utils";
import { StatusArtifact } from "../../status-artifact";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { BadgeBoolean, DrawerItem, MaybeLink },
  K8sApi: { secretsApi },
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
          <MaybeLink
            key="link"
            to={getMaybeDetailsUrl(secretsApi.formatUrlForNotListing({ name: object.spec.secretRef?.name, namespace }))}
            onClick={stopPropagation}
          >
            {object.spec.secretRef?.name}
          </MaybeLink>
        </DrawerItem>
        <DrawerItem name="Pass Credentials" hidden={object.spec.passCredentials === undefined}>
          <BadgeBoolean value={object.spec.passCredentials} />
        </DrawerItem>

        <StatusArtifact artifact={object.status?.artifact} />
      </div>
    );
  },
);
