import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import React from "react";
import { ImageRepository } from "../../../k8s/fluxcd/image/imagerepository-v1";
import { SpecAccessFrom } from "../../spec-access-from";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, DurationAbsoluteTimestamp, LinkToSecret, LinkToServiceAccount },
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
          <DrawerItem name="Canonical Image Name" hidden={!object.status?.canonicalImageName}>
            {object.status?.canonicalImageName}
          </DrawerItem>
          <DrawerItem name="Insecure">
            <BadgeBoolean value={!!object.spec.insecure} />
          </DrawerItem>
          <DrawerItem name="Exclusion" hidden={!object.spec.exclusionList?.length}>
            {object.spec.exclusionList?.map((exclusion) => (
              <DrawerItem name="" key={exclusion}>
                {exclusion}
              </DrawerItem>
            ))}
          </DrawerItem>
          <DrawerItem name="Authentication Provider">{object.spec.provider ?? "generic"}</DrawerItem>
          <DrawerItem name="Image Registry Credentials" hidden={!object.spec.secretRef}>
            <LinkToSecret name={object.spec.secretRef?.name} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="Proxy" hidden={!object.spec.proxySecretRef}>
            <LinkToSecret name={object.spec.proxySecretRef?.name} namespace={namespace} />
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
              <DrawerItem name="Revision" hidden={!object.status.lastScanResult.revision}>
                {object.status.lastScanResult.revision}
              </DrawerItem>
              <DrawerItem name="Tag Count">{object.status.lastScanResult.tagCount}</DrawerItem>
              <DrawerItem name="Latest Tags" hidden={!object.status.lastScanResult.latestTags?.length}>
                {object.status.lastScanResult.latestTags?.map((tag) => (
                  <DrawerItem key={tag} name="">
                    {tag}
                  </DrawerItem>
                ))}
              </DrawerItem>
              <DrawerItem name="Observed Exclusion" hidden={!object.status.observedExclusionList?.length}>
                {object.status.observedExclusionList?.map((exclusion) => (
                  <DrawerItem name="" key={exclusion}>
                    {exclusion}
                  </DrawerItem>
                ))}
              </DrawerItem>
            </div>
          )}
        </div>
      </>
    );
  },
);
