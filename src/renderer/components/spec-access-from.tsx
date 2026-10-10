import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import styles from "./spec-access-from.module.scss";

import type { AccessFrom } from "../k8s/fluxcd/types";

const { observer } = MobxReact;

const {
  Component: { Badge, DrawerItem },
} = Renderer;

export interface SpecAccessFromProps {
  accessFrom?: AccessFrom;
}

export const SpecAccessFrom: React.FC<SpecAccessFromProps> = observer((props) => {
  const { accessFrom } = props;

  if (!accessFrom) return null;

  return (
    <div>
      <DrawerItem name="Access From">
        {accessFrom?.namespaceSelectors.map((namespaceSelector) => (
          <div key={namespaceSelector.matchLabels?.toString()}>
            <div>Match Labels:</div>
            <div className={styles.matchLabels}>
              {Object.entries(namespaceSelector.matchLabels ?? {}).map(([key, value], index) => (
                <Badge label={`${key}=${value ?? ""}`} key={index} />
              ))}
            </div>
          </div>
        ))}
      </DrawerItem>
    </div>
  );
});
