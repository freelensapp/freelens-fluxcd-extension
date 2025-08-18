import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { Bucket } from "../../../k8s/fluxcd/source/bucket";
import { LinkToSecret } from "../../link-to-secret";
import { StatusArtifact } from "../../status-artifact";

const {
  Component: { BadgeBoolean, DrawerItem },
} = Renderer;

export const BucketDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Bucket>> = observer((props) => {
  const { object } = props;
  const namespace = object.getNs();

  return (
    <div>
      <DrawerItem name="Resumed">
        <BadgeBoolean value={!object.spec.suspend} />
      </DrawerItem>
      <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
      <DrawerItem name="Timeout">{object.spec.timeout ?? "60s"}</DrawerItem>
      <DrawerItem name="Provider">{object.spec.provider ?? "generic"}</DrawerItem>
      <DrawerItem name="Bucket">{object.spec.bucketName}</DrawerItem>
      <DrawerItem name="Region" hidden={!object.spec.region}>
        {object.spec.region}
      </DrawerItem>
      <DrawerItem name="Insecure Endpoint" hidden={!object.spec.insecure}>
        <BadgeBoolean value={object.spec.insecure} />
      </DrawerItem>
      <DrawerItem name="Authentication Credentials" hidden={!object.spec.secretRef}>
        <LinkToSecret name={object.spec.secretRef?.name} namespace={namespace} />
      </DrawerItem>

      <StatusArtifact artifact={object.status?.artifact} />
    </div>
  );
});
