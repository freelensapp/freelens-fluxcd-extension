import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { OCIRepository } from "../../../k8s/fluxcd/source/ocirepository";
import { getMaybeDetailsUrl } from "../../../utils";
import { StatusArtifact } from "../../status-artifact";
import { getConditionClass, getConditionText, StatusConditions } from "../../status-conditions";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { Badge, BadgeBoolean, DrawerItem, DrawerTitle, MaybeLink },
  K8sApi: { secretsApi, serviceAccountsApi },
} = Renderer;

export const OCIRepositoryDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<OCIRepository>> = observer(
  (props) => {
    const { object } = props;
    const namespace = object.getNs();

    return (
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
        <DrawerItem name="Authentication Provider">{object.spec.provider ?? "generic"}</DrawerItem>
        <DrawerItem name="Registry Login Credentials" hidden={!object.spec.secretRef}>
          <MaybeLink
            key="link"
            to={getMaybeDetailsUrl(secretsApi.formatUrlForNotListing({ name: object.spec.secretRef?.name, namespace }))}
            onClick={stopPropagation}
          >
            {object.spec.secretRef?.name}
          </MaybeLink>
        </DrawerItem>
        <DrawerItem name="Image Pull Service Account" hidden={!object.spec.serviceAccountName}>
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
        <DrawerItem name="Proxy Configuration" hidden={!object.spec.proxySecretRef}>
          <MaybeLink
            key="link"
            to={getMaybeDetailsUrl(
              secretsApi.formatUrlForNotListing({ name: object.spec.proxySecretRef?.name, namespace }),
            )}
            onClick={stopPropagation}
          >
            {object.spec.proxySecretRef?.name}
          </MaybeLink>
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
              <MaybeLink
                key="link"
                to={getMaybeDetailsUrl(
                  secretsApi.formatUrlForNotListing({ name: object.spec.verify.secretRef?.name, namespace }),
                )}
                onClick={stopPropagation}
              >
                {object.spec.verify.secretRef?.name}
              </MaybeLink>
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

        <StatusConditions conditions={object.status?.conditions} />
      </div>
    );
  },
);
