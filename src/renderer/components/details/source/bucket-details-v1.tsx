import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import React from "react";
import { Bucket } from "../../../k8s/fluxcd/source/bucket-v1";
import { getHeight } from "../../../utils";
import { StatusArtifact } from "../../status-artifact";
import styles from "./bucket-details.module.scss";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToSecret, LinkToServiceAccount, MonacoEditor },
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
      <DrawerItem name="Prefix" hidden={!object.spec.prefix}>
        {object.spec.prefix}
      </DrawerItem>
      <DrawerItem name="Insecure Endpoint" hidden={!object.spec.insecure}>
        <BadgeBoolean value={object.spec.insecure} />
      </DrawerItem>
      <DrawerItem name="Authentication Credentials" hidden={!object.spec.secretRef}>
        <LinkToSecret name={object.spec.secretRef?.name} namespace={namespace} />
      </DrawerItem>
      <DrawerItem name="Service Account" hidden={!object.spec.serviceAccountName}>
        <LinkToServiceAccount name={object.spec.serviceAccountName} namespace={namespace} />
      </DrawerItem>
      <DrawerItem name="TLS Certificate" hidden={!object.spec.certSecretRef}>
        <LinkToSecret name={object.spec.certSecretRef?.name} namespace={namespace} />
      </DrawerItem>
      <DrawerItem name="Proxy Configuration" hidden={!object.spec.proxySecretRef}>
        <LinkToSecret name={object.spec.proxySecretRef?.name} namespace={namespace} />
      </DrawerItem>
      <DrawerItem name="Source Ignore" hidden={!object.spec.ignore}>
        <MonacoEditor
          readOnly
          id="ignore"
          className={styles.editor}
          style={{
            minHeight: getHeight(object.spec.ignore ?? ""),
          }}
          value={object.spec.ignore ?? ""}
          setInitialHeight
          options={{
            scrollbar: {
              alwaysConsumeMouseWheel: false,
            },
          }}
        />
      </DrawerItem>

      {object.spec.sts && (
        <div>
          <DrawerTitle>Security Token Service</DrawerTitle>
          <DrawerItem name="Provider">{object.spec.sts.provider}</DrawerItem>
          <DrawerItem name="Endpoint">{object.spec.sts.endpoint}</DrawerItem>
          <DrawerItem name="Authentication Credentials" hidden={!object.spec.sts.secretRef}>
            <LinkToSecret name={object.spec.sts.secretRef?.name} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="TLS Certificate" hidden={!object.spec.sts.certSecretRef}>
            <LinkToSecret name={object.spec.sts.certSecretRef?.name} namespace={namespace} />
          </DrawerItem>
        </div>
      )}

      <StatusArtifact artifact={object.status?.artifact} />
    </div>
  );
});
