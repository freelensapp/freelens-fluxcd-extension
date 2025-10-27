import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { getHeight } from "../utils";
import styles from "./spec-patches.module.scss";
import stylesInline from "./spec-patches.module.scss?inline";

import type { Patch } from "../k8s/core/types";

const {
  Component: { DrawerItem, DrawerTitle, Icon, MonacoEditor },
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
      <div className={styles.patches}>
        <DrawerTitle>Patches</DrawerTitle>
        {patches.map((patch, index) => {
          if (!patch) return null;
          const key = `patch-${index + 1}`;

          return (
            <div key={key}>
              <div className={styles.title}>
                <Icon small material="list" />
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
              <MonacoEditor
                readOnly
                id={`patch-${key}`}
                className={styles.editor}
                style={{
                  minHeight: getHeight(patch.patch),
                }}
                value={patch.patch}
                setInitialHeight
                options={{
                  scrollbar: {
                    alwaysConsumeMouseWheel: false,
                  },
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
});
