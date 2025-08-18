import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { OCIRepository } from "../../../k8s/fluxcd/source/ocirepository";
import { LinkToSecret } from "../../link-to-secret";
import { LinkToServiceAccount } from "../../link-to-service-account";
import { StatusArtifact } from "../../status-artifact";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle },
} = Renderer;

export const OCIRepositoryDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<OCIRepository>> = observer(
  (props) => {
    const { object } = props;
    const namespace = object.getNs();

    return (
      <div>
        <DrawerItem name="Resumed">
          <BadgeBoolean value={!object.spec.suspend} />
        </DrawerItem>
        <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
        <DrawerItem name="Timeout">{object.spec.timeout}</DrawerItem>
        <DrawerItem name="Authentication Provider">{object.spec.provider ?? "generic"}</DrawerItem>
        <DrawerItem name="Registry Login Credentials" hidden={!object.spec.secretRef}>
          <LinkToSecret name={object.spec.secretRef?.name} namespace={namespace} />
        </DrawerItem>
        <DrawerItem name="Image Pull Service Account" hidden={!object.spec.serviceAccountName}>
          <LinkToServiceAccount name={object.spec.serviceAccountName} namespace={namespace} />
        </DrawerItem>
        <DrawerItem name="TLS Certificate" hidden={!object.spec.certSecretRef}>
          <LinkToSecret name={object.spec.certSecretRef?.name} namespace={namespace} />
        </DrawerItem>
        <DrawerItem name="Proxy Configuration" hidden={!object.spec.proxySecretRef}>
          <LinkToSecret name={object.spec.proxySecretRef?.name} namespace={namespace} />
        </DrawerItem>
        <DrawerItem name="Insecure Container Registry" hidden={object.spec.insecure === undefined}>
          <BadgeBoolean value={object.spec.insecure} />
        </DrawerItem>

        {object.spec.ref && (
          <div>
            <DrawerTitle>OCI Reference</DrawerTitle>
            <DrawerItem name="Digest" hidden={!object.spec.ref.digest}>
              {object.spec.ref.digest}
            </DrawerItem>
            <DrawerItem name="SemVer" hidden={!object.spec.ref.semver}>
              {object.spec.ref.semver}
            </DrawerItem>
            <DrawerItem name="SemVer Filter" hidden={!object.spec.ref.semverFilter}>
              {object.spec.ref.semverFilter}
            </DrawerItem>
            <DrawerItem name="Tag" hidden={!object.spec.ref.tag}>
              {object.spec.ref.tag}
            </DrawerItem>
          </div>
        )}

        {object.spec.layerSelector && (
          <div>
            <DrawerTitle>OCI Layer Selector</DrawerTitle>
            <DrawerItem name="Media type">{object.spec.layerSelector.mediaType}</DrawerItem>
            <DrawerItem name="Operation">{object.spec.layerSelector.operation}</DrawerItem>
          </div>
        )}

        {object.spec.verify && (
          <div>
            <DrawerTitle>Trusted Public Keys</DrawerTitle>
            <DrawerItem name="Provider">{object.spec.verify.provider ?? "cosign"}</DrawerItem>
            <DrawerItem name="Trusted Public Keys" hidden={!object.spec.verify.secretRef}>
              <LinkToSecret name={object.spec.verify.secretRef?.name} namespace={namespace} />
            </DrawerItem>
            <DrawerItem name="OIDC Identity">
              {object.spec.verify.matchOIDCIdentity?.length &&
                object.spec.verify.matchOIDCIdentity.map((match) => (
                  <div>
                    <DrawerTitle>Match</DrawerTitle>
                    <DrawerItem name="Issuer">{match.issuer}</DrawerItem>
                    <DrawerItem name="Subject">{match.subject}</DrawerItem>
                  </div>
                ))}
            </DrawerItem>
          </div>
        )}

        <StatusArtifact artifact={object.status?.artifact} />
      </div>
    );
  },
);
