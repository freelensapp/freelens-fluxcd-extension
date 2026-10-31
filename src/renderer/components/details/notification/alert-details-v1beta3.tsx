import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import React from "react";
import { Alert } from "../../../k8s/fluxcd/notification/alert-v1beta3";
import { withFluxKind, withServedApiVersion } from "../../../k8s/fluxcd/utils";

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
      <DrawerItem name="Event Severity">{object.spec.eventSeverity ?? "info"}</DrawerItem>
      <DrawerItem name="Event Sources">
        {object.spec.eventSources.map((eventSource) => {
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
      <DrawerItem name="Inclusion List" hidden={!object.spec.inclusionList?.length}>
        {object.spec.inclusionList?.join(", ")}
      </DrawerItem>
      <DrawerItem name="Exclusion List" hidden={!object.spec.exclusionList?.length}>
        {object.spec.exclusionList?.join(", ")}
      </DrawerItem>
      <DrawerItem name="Summary" hidden={!object.spec.summary}>
        {object.spec.summary}
      </DrawerItem>
      <DrawerItemLabels
        name="Event Metadata"
        labels={object.spec.eventMetadata ?? {}}
        hidden={!object.spec.eventMetadata}
      />
    </div>
  );
});
