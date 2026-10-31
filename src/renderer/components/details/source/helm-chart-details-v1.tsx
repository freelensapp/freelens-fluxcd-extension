import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import React from "react";
import { HelmChart } from "../../../k8s/fluxcd/source/helmchart-v1";
import { withServedApiVersion } from "../../../k8s/fluxcd/utils";
import { StatusArtifact } from "../../status-artifact";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToObject, LinkToSecret },
} = Renderer;

export const HelmChartDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<HelmChart>> = observer((props) => {
  const { object } = props;
  const namespace = object.getNs();

  return (
    <div>
      <DrawerItem name="Resumed">
        <BadgeBoolean value={!object.spec.suspend} />
      </DrawerItem>
      <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
      <DrawerItem name="Chart">{object.spec.chart}</DrawerItem>
      <DrawerItem name="Version">{object.spec.version ?? "*"}</DrawerItem>
      <DrawerItem name="Reconcile Strategy">{object.spec.reconcileStrategy ?? "ChartVersion"}</DrawerItem>
      <DrawerItem name="Source">
        <LinkToObject objectRef={withServedApiVersion(object.spec.sourceRef)} object={object} />
      </DrawerItem>
      <DrawerItem name="Values Files" hidden={!object.spec.valuesFiles?.length}>
        {object.spec.valuesFiles?.length &&
          object.spec.valuesFiles.map((file) => (
            <DrawerItem key={file} name="">
              {file}
            </DrawerItem>
          ))}
      </DrawerItem>
      <DrawerItem name="Ignore Missing Values Files" hidden={object.spec.ignoreMissingValuesFiles === undefined}>
        <BadgeBoolean value={object.spec.ignoreMissingValuesFiles} />
      </DrawerItem>

      {object.spec.verify && (
        <div>
          <DrawerTitle>Trusted Public Keys</DrawerTitle>
          <DrawerItem name="Provider">{object.spec.verify.provider}</DrawerItem>
          <DrawerItem name="Trusted Public Keys" hidden={!object.spec.verify.secretRef}>
            <LinkToSecret name={object.spec.verify.secretRef?.name} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="OIDC Identity" hidden={!object.spec.verify.matchOIDCIdentity?.length}>
            {object.spec.verify.matchOIDCIdentity?.map((match) => (
              <div key={`${match.issuer}-${match.subject}`}>
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
});
