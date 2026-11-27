import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { HelmRelease } from "../../../k8s/fluxcd/helm/helmrelease-v2";
import { getHeight } from "../../../utils";
import styles from "./helm-release-details.module.scss";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToSecret, LinkToServiceAccount, MonacoEditor },
} = Renderer;

/**
 * The layer that an `OCIRepository` template selects when it sets no `layerSelector`: the Helm chart layer, copied as
 * it is (`buildOCIRepositoryFromTemplate` of helm-controller, `registry.ChartLayerMediaType` of Helm).
 */
const chartLayerMediaType = "application/vnd.cncf.helm.chart.content.v1.tar+gzip";

/**
 * The fields of an `OCIRepository` chart template that the panel does not show elsewhere, laid out as the details of
 * an `OCIRepository` and with its defaults, except for the layer selector, whose default differs.
 */
export const HelmReleaseOCIRepositoryTemplate = observer(({ object }: { object: HelmRelease }) => {
  const spec = object.spec.chart?.spec;
  if (!spec || HelmRelease.getChartTemplateKind(object) !== "OCIRepository") return null;

  // The generated object is in the namespace of the HelmRelease, and so are the objects it refers to.
  const namespace = HelmRelease.getChartTemplateRef(object)?.namespace;

  return (
    <div>
      <DrawerTitle>OCI Repository Template</DrawerTitle>
      <DrawerItem name="Resumed">
        <BadgeBoolean value={!spec.suspend} />
      </DrawerItem>
      <DrawerItem name="Timeout">{spec.timeout ?? "60s"}</DrawerItem>
      <DrawerItem name="Authentication Provider">{spec.provider ?? "generic"}</DrawerItem>
      <DrawerItem name="Registry Login Credentials" hidden={!spec.secretRef}>
        <LinkToSecret name={spec.secretRef?.name} namespace={namespace} />
      </DrawerItem>
      <DrawerItem name="Image Pull Service Account" hidden={!spec.serviceAccountName}>
        <LinkToServiceAccount name={spec.serviceAccountName} namespace={namespace} />
      </DrawerItem>
      <DrawerItem name="TLS Certificate" hidden={!spec.certSecretRef}>
        <LinkToSecret name={spec.certSecretRef?.name} namespace={namespace} />
      </DrawerItem>
      <DrawerItem name="Proxy Configuration" hidden={!spec.proxySecretRef}>
        <LinkToSecret name={spec.proxySecretRef?.name} namespace={namespace} />
      </DrawerItem>
      <DrawerItem name="Insecure Container Registry" hidden={spec.insecure === undefined}>
        <BadgeBoolean value={spec.insecure ?? false} />
      </DrawerItem>
      <DrawerItem name="SemVer Filter" hidden={!spec.ref?.semverFilter}>
        {spec.ref?.semverFilter}
      </DrawerItem>
      <DrawerItem name="Layer Selector">
        {spec.layerSelector ? (
          <>
            <DrawerItem name="Media type" hidden={!spec.layerSelector.mediaType}>
              {spec.layerSelector.mediaType}
            </DrawerItem>
            <DrawerItem name="Operation">{spec.layerSelector.operation ?? "extract"}</DrawerItem>
          </>
        ) : (
          <>
            <DrawerItem name="Media type">{chartLayerMediaType}</DrawerItem>
            <DrawerItem name="Operation">copy</DrawerItem>
          </>
        )}
      </DrawerItem>
      <DrawerItem name="Source Ignore" hidden={!spec.ignore}>
        <MonacoEditor
          readOnly
          id="chartIgnore"
          className={styles.editor}
          style={{
            minHeight: getHeight(spec.ignore ?? ""),
          }}
          value={spec.ignore ?? ""}
          setInitialHeight
          options={{
            scrollbar: {
              alwaysConsumeMouseWheel: false,
            },
          }}
        />
      </DrawerItem>
    </div>
  );
});

/**
 * The verification of the chart template. A generated `HelmChart` gets only the provider and the Secret of the keys
 * (`buildHelmChartFromTemplate` of helm-controller), a generated `OCIRepository` the whole of it.
 */
export const HelmReleaseChartVerification = observer(({ object }: { object: HelmRelease }) => {
  const verify = object.spec.chart?.spec.verify;
  if (!verify) return null;

  const isOCIRepository = HelmRelease.getChartTemplateKind(object) === "OCIRepository";
  const namespace = HelmRelease.getChartTemplateRef(object)?.namespace;

  return (
    <div>
      <DrawerTitle>Chart Verification</DrawerTitle>
      <DrawerItem name="Provider">{verify.provider ?? "cosign"}</DrawerItem>
      <DrawerItem name="Trusted Public Keys" hidden={!verify.secretRef}>
        <LinkToSecret name={verify.secretRef?.name} namespace={namespace} />
      </DrawerItem>
      <DrawerItem name="Trusted Root" hidden={!isOCIRepository || !verify.trustedRootSecretRef}>
        <LinkToSecret name={verify.trustedRootSecretRef?.name} namespace={namespace} />
      </DrawerItem>
      <DrawerItem name="OIDC Identity" hidden={!isOCIRepository || !verify.matchOIDCIdentity?.length}>
        {verify.matchOIDCIdentity?.map((match) => (
          <div key={`${match.issuer}-${match.subject}`}>
            <DrawerTitle>Match</DrawerTitle>
            <DrawerItem name="Issuer">{match.issuer}</DrawerItem>
            <DrawerItem name="Subject">{match.subject}</DrawerItem>
          </div>
        ))}
      </DrawerItem>
    </div>
  );
});
