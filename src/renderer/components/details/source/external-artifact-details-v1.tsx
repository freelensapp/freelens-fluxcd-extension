import { Common, Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import React from "react";
import { ExternalArtifact } from "../../../k8s/fluxcd/source/externalartifact-v1";
import { getMaybeDetailsUrl } from "../../../utils";
import { StatusArtifact } from "../../status-artifact";

const { observer } = MobxReact;

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { DrawerItem, MaybeLink },
} = Renderer;

export const ExternalArtifactDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<ExternalArtifact>> = observer(
  (props) => {
    const { object } = props;

    return (
      <div>
        <DrawerItem name="Source" hidden={!object.spec?.sourceRef}>
          <MaybeLink
            key="link"
            to={getMaybeDetailsUrl(ExternalArtifact.getSourceRefUrl(object))}
            onClick={stopPropagation}
          >
            {ExternalArtifact.getSourceRefText(object)}
          </MaybeLink>
        </DrawerItem>

        <StatusArtifact artifact={object.status?.artifact} />
      </div>
    );
  },
);
