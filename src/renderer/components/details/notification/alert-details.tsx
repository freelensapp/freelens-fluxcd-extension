import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { Alert } from "../../../k8s/fluxcd/notification/alert";
import { getRefUrl } from "../../../k8s/fluxcd/utils";
import { getMaybeDetailsUrl } from "../../../utils";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { Badge, BadgeBoolean, DrawerItem, DrawerTitle, MaybeLink },
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
        {object.spec.eventSources?.map((eventSource, index: number) => (
          <DrawerItem key={index} name="">
            {eventSource.name === "*" ? (
              <Badge label={`${eventSource.kind}:${eventSource.name}`} />
            ) : (
              <MaybeLink to={getMaybeDetailsUrl(getRefUrl(eventSource, object))} onClick={stopPropagation}>
                <Badge label={`${eventSource.kind}:${eventSource.name}`} />
              </MaybeLink>
            )}
          </DrawerItem>
        ))}
      </DrawerItem>
      <DrawerItem name="Provider">
        <MaybeLink
          to={getMaybeDetailsUrl(getRefUrl({ kind: "Provider", name: object.spec.providerRef?.name ?? "" }, object))}
          onClick={stopPropagation}
        >
          {object.spec.providerRef?.name}
        </MaybeLink>
      </DrawerItem>
      {object.spec.eventMetadata && (
        <>
          <DrawerTitle>Event Metadata</DrawerTitle>
          {Object.entries(object.spec.eventMetadata).map(([name, value], index) => (
            <DrawerItem key={index} name={name}>
              {value}
            </DrawerItem>
          ))}
        </>
      )}
    </div>
  );
});
