import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { ImageRepository } from "../../../k8s/fluxcd/image/imagerepository";
import { getMaybeDetailsUrl } from "../../../utils";
import { SpecAccessFrom } from "../../spec-access-from";
import { getConditionClass, getConditionText, StatusConditions } from "../../status-conditions";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { Badge, BadgeBoolean, DrawerItem, DrawerTitle, MaybeLink },
  K8sApi: { secretsApi, serviceAccountsApi },
} = Renderer;

export const ImageRepositoryDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<ImageRepository>> = observer(
  (props) => {
    const { object } = props;
    const namespace = object.getNs();

    return (
      <>
        <div>
          <DrawerItem name="Condition">
            <Badge
              className={getConditionClass(object.status?.conditions)}
              label={getConditionText(object.status?.conditions)}
            />
          </DrawerItem>
          <DrawerItem name="Resumed">
            <BadgeBoolean value={!object.spec.suspend} />
          </DrawerItem>
          <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
          <DrawerItem name="Timeout">{object.spec.timeout}</DrawerItem>
          <DrawerItem name="Image">{object.spec.image}</DrawerItem>
          <DrawerItem name="Exclusion" hidden={!object.spec.exclusionList?.length}>
            {object.spec.exclusionList?.map((exclusion) => (
              <DrawerItem name="" key={exclusion}>
                {exclusion}
              </DrawerItem>
            ))}
          </DrawerItem>
          <DrawerItem name="Image Registry Credentials" hidden={!object.spec.secretRef}>
            <MaybeLink
              key="link"
              to={getMaybeDetailsUrl(
                secretsApi.formatUrlForNotListing({ name: object.spec.secretRef?.name, namespace }),
              )}
              onClick={stopPropagation}
            >
              {object.spec.secretRef?.name}
            </MaybeLink>
          </DrawerItem>
          <DrawerItem name="Service Account" hidden={!object.spec.serviceAccountName}>
            <MaybeLink
              key="link"
              to={getMaybeDetailsUrl(
                serviceAccountsApi.formatUrlForNotListing({ name: object.spec.serviceAccountName, namespace }),
              )}
              onClick={stopPropagation}
            >
              {object.spec.serviceAccountName}
            </MaybeLink>
          </DrawerItem>
          <DrawerItem name="TLS Certificate" hidden={!object.spec.certSecretRef}>
            <MaybeLink
              key="link"
              to={getMaybeDetailsUrl(
                secretsApi.formatUrlForNotListing({ name: object.spec.certSecretRef?.name, namespace }),
              )}
              onClick={stopPropagation}
            >
              {object.spec.secretRef?.name}
            </MaybeLink>
          </DrawerItem>

          <SpecAccessFrom accessFrom={object.spec.accessFrom} />

          {object.status?.lastScanResult && (
            <div>
              <DrawerTitle>Scan Result</DrawerTitle>
              <DrawerItem name="Scan Time">{object.status.lastScanResult.scanTime}</DrawerItem>
              <DrawerItem name="Tag Count">{object.status.lastScanResult.tagCount}</DrawerItem>
              <DrawerItem name="Latest Tags" hidden={!object.status.lastScanResult.latestTags?.length}>
                {object.status.lastScanResult.latestTags.map((tag) => (
                  <DrawerItem name="">{tag}</DrawerItem>
                ))}
              </DrawerItem>
            </div>
          )}

          <StatusConditions conditions={object.status?.conditions} />
        </div>
      </>
    );
  },
);
