import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { HelmRepository } from "../../../k8s/fluxcd/source/helmrepository";
import { getConditionClass, getConditionText, StatusConditions } from "../../conditions";

const {
  Component: { DrawerItem, Badge },
} = Renderer;

const {
  Util: { openBrowser },
} = Common;

export const HelmRepositoryDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<HelmRepository>> = observer(
  (props) => {
    const { object } = props;

    return (
      <div>
        <DrawerItem name="Condition">
          <Badge className={getConditionClass(object)} label={getConditionText(object)} />
        </DrawerItem>
        <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
        <DrawerItem name="Timeout">{object.spec.timeout}</DrawerItem>
        <DrawerItem name="Suspended">{object.spec.suspend === true ? "Yes" : "No"}</DrawerItem>
        <DrawerItem name="Url">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              openBrowser(object.spec.url);
            }}
          >
            {object.spec.url}
          </a>
        </DrawerItem>

        <StatusConditions object={object} />
      </div>
    );
  },
);
