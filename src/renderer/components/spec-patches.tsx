import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { checksum } from "../utils";
import styles from "./spec-patches.module.scss";
import stylesInline from "./spec-patches.module.scss?inline";
import { YamlDump } from "./yaml-dump";

import type { Patch } from "../k8s/core/types";

const {
  Component: { DrawerItem, DrawerTitle, Icon },
} = Renderer;

export interface SpecPatchesProps {
  patches?: Patch[];
}

export const SpecPatches: React.FC<SpecPatchesProps> = observer((props) => {
  const { patches } = props;

  if (!patches || !patches.length) return null;

  return (
    <>
      <style>{stylesInline}</style>
      <DrawerTitle>Patches</DrawerTitle>
      {patches.map((patch, index) => {
        if (!patch) return null;

        return (
          <div key={checksum(patch)}>
            <div className={styles.title}>
              <Icon small material="list" /> {index + 1}
            </div>
            <DrawerItem name="Group" hidden={!patch.target?.group}>
              {patch.target?.group}
            </DrawerItem>
            <DrawerItem name="Version" hidden={!patch.target?.version}>
              {patch.target?.version}
            </DrawerItem>
            <DrawerItem name="Kind" hidden={!patch.target?.kind}>
              {patch.target?.kind}
            </DrawerItem>
            <DrawerItem name="Name" hidden={!patch.target?.name}>
              {patch.target?.name}
            </DrawerItem>
            <DrawerItem name="Namespace" hidden={!patch.target?.namespace}>
              {patch.target?.namespace}
            </DrawerItem>
            <DrawerItem name="Label Selector" hidden={!patch.target?.labelSelector}>
              {patch.target?.labelSelector}
            </DrawerItem>
            <DrawerItem name="Annotation Selector" hidden={!patch.target?.annotationSelector}>
              {patch.target?.annotationSelector}
            </DrawerItem>
            <div className="DrawerItem">Patch</div>
            <YamlDump data={patch.patch} />
          </div>
        );
      })}
    </>
  );
});
