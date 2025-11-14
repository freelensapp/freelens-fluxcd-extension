import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { checksum } from "../utils";
import styles from "./status-history.module.scss";
import stylesInline from "./status-history.module.scss?inline";

import type { History } from "../k8s/fluxcd/types";

const {
  Component: { DrawerItem, DrawerItemLabels, DrawerTitle, DurationAbsoluteTimestamp, Icon },
} = Renderer;

export interface StatusHistoryProps {
  history?: History;
}

export const StatusHistory: React.FC<StatusHistoryProps> = observer((props) => {
  const { history } = props;

  if (!history || !history.length) return null;

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.history}>
        <DrawerTitle>History</DrawerTitle>
        {history.map((snapshot) => (
          <div key={checksum(snapshot)}>
            <div className={styles.title}>
              <Icon small material="history" />
            </div>
            <DrawerItem name="Digest">{snapshot.digest}</DrawerItem>
            <DrawerItem name="First Reconciled">
              <DurationAbsoluteTimestamp timestamp={snapshot.firstReconciled} />
            </DrawerItem>
            <DrawerItem name="Last Reconciled">
              <DurationAbsoluteTimestamp timestamp={snapshot.lastReconciled} />
            </DrawerItem>
            <DrawerItem name="Last Reconciled Duration">{snapshot.lastReconciledDuration}</DrawerItem>
            <DrawerItem name="Last Reconciled Status">{snapshot.lastReconciledStatus}</DrawerItem>
            <DrawerItem name="Total Reconciliations">{snapshot.totalReconciliations}</DrawerItem>
            <DrawerItemLabels name="Metadata" labels={snapshot.metadata ?? {}} hidden={!snapshot.metadata} />
          </div>
        ))}
      </div>
    </>
  );
});
