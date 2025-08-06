import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { HelmChart } from "../../../k8s/fluxcd/source/helmchart";
import { getRefUrl } from "../../../k8s/fluxcd/utils";
import { getMaybeDetailsUrl } from "../../../utils";
import { StatusArtifact } from "../../status-artifact";
import { getConditionClass, getConditionText, StatusConditions } from "../../status-conditions";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { Badge, BadgeBoolean, DrawerItem, MaybeLink },
} = Renderer;

export const HelmChartDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<HelmChart>> = observer((props) => {
  const { object } = props;

  return (
    <div>
      <DrawerItem name="Condition">
        <Badge className={getConditionClass(object)} label={getConditionText(object)} />
      </DrawerItem>
      <DrawerItem name="Suspended">
        <BadgeBoolean value={object.spec.suspend ?? false} />
      </DrawerItem>
      <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
      <DrawerItem name="Chart">{object.spec.chart}</DrawerItem>
      <DrawerItem name="Version">{object.spec.version}</DrawerItem>
      <DrawerItem name="Reconcile Strategy">{object.spec.reconcileStrategy}</DrawerItem>
      <DrawerItem name="Source">
        <MaybeLink to={getMaybeDetailsUrl(getRefUrl(object.spec.sourceRef, object))} onClick={stopPropagation}>
          {object.spec.sourceRef?.kind}: {object.spec.sourceRef?.name}
        </MaybeLink>
      </DrawerItem>
      <DrawerItem name="Values Files" hidden={!object.spec.valuesFiles || !object.spec.valuesFiles.length}>
        {object.spec.valuesFiles?.length ? (
          <ul>
            {object.spec.valuesFiles.map((file) => (
              <li>{file}</li>
            ))}
          </ul>
        ) : (
          <></>
        )}
      </DrawerItem>
      <DrawerItem name="Values File" hidden={!object.spec.valuesFile}>
        <ul>
          <li>{object.spec.valuesFile}</li>
        </ul>
      </DrawerItem>

      <StatusArtifact object={object} />

      <StatusConditions object={object} />
    </div>
  );
});
