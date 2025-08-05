import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { HelmRepository } from "../../../k8s/fluxcd/source/helmrepository";
import { StatusArtifact } from "../../status-artifact";
import { getConditionClass, getConditionText, StatusConditions } from "../../status-conditions";

const {
  Component: { Badge, BadgeBoolean, DrawerItem },
} = Renderer;

export const HelmRepositoryDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<HelmRepository>> = observer(
  (props) => {
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
        <DrawerItem name="Timeout">{object.spec.timeout}</DrawerItem>

        <StatusArtifact object={object} />

        <StatusConditions object={object} />
      </div>
    );
  },
);
