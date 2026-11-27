import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import React from "react";
import { Alert } from "../../../k8s/fluxcd/notification/alert-v1beta2";
import { withFluxKind, withServedApiVersion } from "../../../k8s/fluxcd/utils";
import { BadgeSuspended } from "../../badge-suspended";

const { observer } = MobxReact;

const {
  Component: { Badge, DrawerItem, DrawerItemLabels, LinkToObject },
} = Renderer;

export const AlertDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<Alert>> = observer((props) => {
  const { object } = props;

  return (
    <div>
      <DrawerItem name="Suspended">
        <BadgeSuspended value={object.spec.suspend ?? false} />
      </DrawerItem>
      <DrawerItem name="Event Severity">{object.spec.eventSeverity}</DrawerItem>
      <DrawerItem name="Event Sources">
        {object.spec.eventSources?.map((eventSource) => {
          const badge = <Badge label={`${eventSource.kind}:${eventSource.name}`} />;
          return (
            <DrawerItem key={Renderer.Util.createReactKey(eventSource)} name="">
              {eventSource.name === "*" ? (
                badge
              ) : (
                <LinkToObject objectRef={withServedApiVersion(eventSource)} object={object} content={badge} />
              )}
            </DrawerItem>
          );
        })}
      </DrawerItem>
      <DrawerItem name="Provider">
        <LinkToObject objectRef={withFluxKind(object.spec.providerRef, "Provider")} object={object} />
      </DrawerItem>
      <DrawerItemLabels
        name="Event Metadata"
        labels={object.spec.eventMetadata ?? {}}
        hidden={!object.spec.eventMetadata}
      />
    </div>
  );
});
