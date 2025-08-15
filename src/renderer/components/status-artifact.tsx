import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { DurationAbsoluteTimestamp } from "./duration-absolute";
import styles from "./status-artifact.module.scss";
import stylesInline from "./status-artifact.module.scss?inline";

import type { Artifact } from "../k8s/fluxcd/types";

const {
  Component: { DrawerTitle, DrawerItem },
} = Renderer;

export interface StatusArtifactProps {
  artifact?: Artifact;
}

export const StatusArtifact: React.FC<StatusArtifactProps> = observer((props) => {
  const { artifact } = props;

  if (!artifact) return null;

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.artifact}>
        <DrawerTitle>Artifact</DrawerTitle>
        <div key={`${artifact.path}:${artifact.url}`}>
          <DrawerItem name="Path">{artifact.path}</DrawerItem>
          <DrawerItem name="URL">{artifact.url}</DrawerItem>
          <DrawerItem name="Revision" hidden={!artifact.revision}>
            {artifact.revision}
          </DrawerItem>
          <DrawerItem name="Checksum" hidden={!artifact.checksum}>
            {artifact.checksum}
          </DrawerItem>
          <DrawerItem name="Size" hidden={!artifact.size}>
            {artifact.size}
          </DrawerItem>
          <DrawerItem name="Last Update Time">
            <DurationAbsoluteTimestamp timestamp={artifact.lastUpdateTime} />
          </DrawerItem>
        </div>
      </div>
    </>
  );
});
