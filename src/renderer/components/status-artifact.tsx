import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import styles from "./status-artifact.module.scss";
import stylesInline from "./status-artifact.module.scss?inline";

import type { FluxCDKubeObjectSpecWithSuspend, FluxCDKubeObjectStatusWithArtifact } from "../k8s/fluxcd/types";

export type KubeObjectWithArtifact = Renderer.K8sApi.KubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  FluxCDKubeObjectStatusWithArtifact,
  {} | FluxCDKubeObjectSpecWithSuspend
>;

const {
  Component: { DrawerTitle, DrawerItem },
} = Renderer;

export const StatusArtifact: React.FC<Renderer.Component.KubeObjectDetailsProps<KubeObjectWithArtifact>> = observer(
  (props) => {
    const { object } = props;

    if (!object.status?.artifact) return null;

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.artifact}>
          <DrawerTitle>Artifact</DrawerTitle>
          <div key={`${object.status.artifact.path}:${object.status.artifact.url}`}>
            <DrawerItem name="Path">{object.status.artifact.path}</DrawerItem>
            <DrawerItem name="URL">{object.status.artifact.url}</DrawerItem>
            <DrawerItem name="Revision" hidden={!object.status.artifact.revision}>
              {object.status.artifact.revision}
            </DrawerItem>
            <DrawerItem name="Checksum" hidden={!object.status.artifact.checksum}>
              {object.status.artifact.checksum}
            </DrawerItem>
            <DrawerItem name="Size" hidden={!object.status.artifact.size}>
              {object.status.artifact.size}
            </DrawerItem>
            <DrawerItem name="Last Update Time">{object.status.artifact.lastUpdateTime}</DrawerItem>
          </div>
        </div>{" "}
      </>
    );
  },
);
