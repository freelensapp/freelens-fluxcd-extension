import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { HelmChart } from "../../../k8s/fluxcd/source/helmchart-v1";
import { LinkToObject } from "../../link-to-object";
import { StatusArtifact } from "../../status-artifact";

const {
  Component: { BadgeBoolean, DrawerItem },
} = Renderer;

export const HelmChartDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<HelmChart>> = observer((props) => {
  const { object } = props;

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
        <LinkToObject objectRef={object.spec.sourceRef} object={object} />
      </DrawerItem>
      <DrawerItem name="Values Files" hidden={!object.spec.valuesFiles?.length}>
        {object.spec.valuesFiles?.length &&
          object.spec.valuesFiles.map((file) => <DrawerItem name="">{file}</DrawerItem>)}
      </DrawerItem>
      <DrawerItem name="Values File" hidden={!object.spec.valuesFile}>
        <DrawerItem name="">{object.spec.valuesFile}</DrawerItem>
      </DrawerItem>

      <StatusArtifact artifact={object.status?.artifact} />
    </div>
  );
});
