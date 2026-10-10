import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import styles from "./status-history.module.scss";

import type { History } from "../k8s/fluxcd/types";

const { observer } = MobxReact;

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
    <div className={styles.history}>
      <DrawerTitle>History</DrawerTitle>
      {history.map((snapshot) => (
        <div key={Renderer.Util.createReactKey(snapshot)}>
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
  );
});
