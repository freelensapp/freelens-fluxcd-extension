import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { ImageRepository } from "../../../k8s/fluxcd/image/imagerepository-v1beta2";
import { DurationAbsoluteTimestamp } from "../../duration-absolute";
import { LinkToSecret } from "../../link-to-secret";
import { LinkToServiceAccount } from "../../link-to-service-account";
import { SpecAccessFrom } from "../../spec-access-from";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle },
} = Renderer;

export const ImageRepositoryDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<ImageRepository>> = observer(
  (props) => {
    const { object } = props;
    const namespace = object.getNs();

    return (
      <>
        <div>
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
            <LinkToSecret name={object.spec.secretRef?.name} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="Service Account" hidden={!object.spec.serviceAccountName}>
            <LinkToServiceAccount name={object.spec.serviceAccountName} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="TLS Certificate" hidden={!object.spec.certSecretRef}>
            <LinkToSecret name={object.spec.certSecretRef?.name} namespace={namespace} />
          </DrawerItem>

          <SpecAccessFrom accessFrom={object.spec.accessFrom} />

          {object.status?.lastScanResult && (
            <div>
              <DrawerTitle>Scan Result</DrawerTitle>
              <DrawerItem name="Scan Time">
                <DurationAbsoluteTimestamp timestamp={object.status.lastScanResult.scanTime} />
              </DrawerItem>
              <DrawerItem name="Tag Count">{object.status.lastScanResult.tagCount}</DrawerItem>
              <DrawerItem name="Latest Tags" hidden={!object.status.lastScanResult.latestTags?.length}>
                {object.status.lastScanResult.latestTags.map((tag) => (
                  <DrawerItem name="">{tag}</DrawerItem>
                ))}
              </DrawerItem>
            </div>
          )}
        </div>
      </>
    );
  },
);
