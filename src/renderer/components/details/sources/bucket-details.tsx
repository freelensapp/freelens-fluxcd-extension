import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { Bucket } from "../../../k8s/fluxcd/source/bucket";
import { getMaybeDetailsUrl } from "../../../utils";
import { StatusArtifact } from "../../status-artifact";
import { getConditionClass, getConditionText, StatusConditions } from "../../status-conditions";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { Badge, BadgeBoolean, DrawerItem, MaybeLink },
  K8sApi: { secretsApi },
} = Renderer;

export const BucketDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Bucket>> = observer((props) => {
  const { object } = props;
  const namespace = object.getNs();

  return (
    <div>
      <DrawerItem name="Condition">
        <Badge className={getConditionClass(object)} label={getConditionText(object)} />
      </DrawerItem>
      <DrawerItem name="Suspended">
        <BadgeBoolean value={object.spec.suspend ?? false} />
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
        <MaybeLink
          key="link"
          to={getMaybeDetailsUrl(secretsApi.formatUrlForNotListing({ name: object.spec.secretRef?.name, namespace }))}
          onClick={stopPropagation}
        >
          {object.spec.secretRef?.name}
        </MaybeLink>
      </DrawerItem>

      <StatusArtifact object={object} />

      <StatusConditions object={object} />
    </div>
  );
});
