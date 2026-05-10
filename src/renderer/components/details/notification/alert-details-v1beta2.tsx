import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import React from "react";
import { Alert } from "../../../k8s/fluxcd/notification/alert-v1beta2";

const { observer } = MobxReact;

const {
  Component: { Badge, BadgeBoolean, DrawerItem, DrawerItemLabels, LinkToObject },
} = Renderer;

export const AlertDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Alert>> = observer((props) => {
  const { object } = props;

  return (
    <div>
      <DrawerItem name="Resumed">
        <BadgeBoolean value={!object.spec.suspend} />
      </DrawerItem>
      <DrawerItem name="Event Severity">{object.spec.eventSeverity}</DrawerItem>
      <DrawerItem name="Event Sources">
        {object.spec.eventSources?.map((eventSource) => {
          const badge = <Badge label={`${eventSource.kind}:${eventSource.name}`} />;
          return (
            <DrawerItem key={`${eventSource.kind}:${eventSource.name}`} name="">
              {eventSource.name === "*" ? (
                badge
              ) : (
                <LinkToObject objectRef={eventSource} object={object} content={badge} />
              )}
            </DrawerItem>
          );
        })}
      </DrawerItem>
      <DrawerItem name="Provider">
        <LinkToObject objectRef={object.spec.providerRef} object={object} />
      </DrawerItem>
      <DrawerItemLabels
        name="Event Metadata"
        labels={object.spec.eventMetadata ?? {}}
        hidden={!object.spec.eventMetadata}
      />
    </div>
  );
});
