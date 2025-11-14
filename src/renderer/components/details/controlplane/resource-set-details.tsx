import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { checksum } from "../../../utils";
import { DurationAbsoluteTimestamp } from "../../duration-absolute";
import { LinkToNamespace } from "../../link-to-namespace";
import { LinkToObject } from "../../link-to-object";
import { LinkToServiceAccount } from "../../link-to-service-account";
import { StatusHistory } from "../../status-history";
import { StatusInventory } from "../../status-inventory";
import { YamlDump } from "../../yaml-dump";
import styles from "./resource-set-details.module.scss";
import stylesInline from "./resource-set-details.module.scss?inline";

import type { ResourceSet } from "../../../k8s/fluxcd/controlplane/resourceset-v1";

const {
  Component: { Badge, BadgeBoolean, DrawerItem, DrawerItemLabels, DrawerTitle, Icon },
} = Renderer;

export const ResourceSetDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<ResourceSet>> = observer(
  (props) => {
    const { object } = props;
    const namespace = object.getNs();

    return (
      <>
        <style>{stylesInline}</style>

        <DrawerItem name="Reconciliation Enabled">
          <BadgeBoolean
            value={(object.metadata.annotations?.["fluxcd.controlplane.io/reconcile"] ?? "enabled") === "enabled"}
          />
        </DrawerItem>
        <DrawerItem name="Reconciliation Interval">
          {object.metadata.annotations?.["fluxcd.controlplane.io/reconcileEvery"] ?? "1h (default)"}
        </DrawerItem>
        <DrawerItem name="Reconciliation Timeout">
          {object.metadata.annotations?.["fluxcd.controlplane.io/reconcileTimeout"] ?? "5m (default)"}
        </DrawerItem>
        <DrawerItem name="Last Handled Reconcile At" hidden={!object.status?.lastHandledReconcileAt}>
          <DurationAbsoluteTimestamp timestamp={object.status?.lastHandledReconcileAt} />
        </DrawerItem>
        <DrawerItem name="Last Applied Revision" hidden={!object.status?.lastAppliedRevision}>
          {object.status?.lastAppliedRevision}
        </DrawerItem>
        <DrawerItem name="Replace Immutable Fields">
          <BadgeBoolean
            value={(object.metadata.annotations?.["fluxcd.controlplane.io/force"] ?? "disabled") === "enabled"}
          />
        </DrawerItem>
        <DrawerItem name="Wait">
          <BadgeBoolean value={object.spec.wait ?? false} />
        </DrawerItem>
        <DrawerItemLabels
          name="Common Labels"
          labels={object.spec.commonMetadata?.labels ?? {}}
          hidden={!object.spec.commonMetadata?.labels}
        />
        <DrawerItemLabels
          name="Common Annotations"
          labels={object.spec.commonMetadata?.annotations ?? {}}
          hidden={!object.spec.commonMetadata?.annotations}
        />
        <DrawerItem name="Service Account" hidden={!object.spec?.serviceAccountName}>
          <LinkToServiceAccount name={object.spec?.serviceAccountName} namespace={namespace} />
        </DrawerItem>

        {object.spec.dependsOn && (
          <div>
            <DrawerTitle>Depends On</DrawerTitle>
            {object.spec.dependsOn.map((dependency) => {
              return (
                <div className="dependency" key={dependency.name + (dependency.namespace ?? "")}>
                  <div className={styles.title}>
                    <Icon small material="list" />
                  </div>
                  <DrawerItem name="API Version" hidden={!dependency.apiVersion}>
                    {dependency.apiVersion}
                  </DrawerItem>
                  <DrawerItem name="Kind" hidden={!dependency.kind}>
                    {dependency.kind}
                  </DrawerItem>
                  <DrawerItem name="Name">
                    <LinkToObject objectRef={dependency} object={object} />
                  </DrawerItem>
                  <DrawerItem name="Namespace" hidden={!dependency.namespace}>
                    <LinkToNamespace namespace={dependency.namespace ?? namespace} />
                  </DrawerItem>
                  <DrawerItem name="Ready">
                    <BadgeBoolean value={dependency.ready ?? false} />
                  </DrawerItem>
                  <DrawerItem name="Ready Expression" hidden={!dependency.readyExpr}>
                    <YamlDump data={dependency.readyExpr} />
                  </DrawerItem>
                </div>
              );
            })}
          </div>
        )}

        {object.spec?.inputsFrom && object.spec.inputsFrom.length > 0 && (
          <div>
            <DrawerTitle>Inputs From</DrawerTitle>
            {object.spec.inputsFrom.map((inputsFrom) => (
              <div key={checksum(inputsFrom)}>
                <div className={styles.title}>
                  <Icon small material="list" />
                </div>
                <DrawerItem name="API Version" hidden={!inputsFrom.apiVersion}>
                  {inputsFrom.apiVersion}
                </DrawerItem>
                <DrawerItem name="Kind" hidden={!inputsFrom.kind}>
                  {inputsFrom.kind}
                </DrawerItem>
                <DrawerItem name="Name" hidden={!inputsFrom.name}>
                  <LinkToServiceAccount name={inputsFrom.name} namespace={namespace} />
                </DrawerItem>
                <DrawerItem name="Selector" hidden={!inputsFrom.selector}>
                  <DrawerItemLabels name="Match Labels" labels={inputsFrom.selector?.matchLabels ?? {}} />
                  <DrawerItem name="Match Expressions" hidden={!inputsFrom.selector?.matchExpressions}>
                    {inputsFrom.selector?.matchExpressions?.map((expr) => (
                      <div key={checksum(expr)}>
                        <DrawerItem name="Key">{expr.key}</DrawerItem>
                        <DrawerItem name="Operator">{expr.operator}</DrawerItem>
                        <DrawerItem name="Values" hidden={!expr.values || expr.values.length === 0}>
                          {expr.values?.map((value) => (
                            <Badge key={value} label={value} />
                          ))}
                        </DrawerItem>
                      </div>
                    ))}
                  </DrawerItem>
                </DrawerItem>
              </div>
            ))}
          </div>
        )}

        {object.spec?.inputs && object.spec?.inputs.length > 0 && (
          <div className={styles.inputs}>
            <DrawerTitle>Inputs</DrawerTitle>
            {object.spec.inputs.map((input, index) => (
              <div key={checksum(input)}>
                <div className={styles.title}>
                  <Icon small material="list" />
                  <span>{index + 1}</span>
                </div>
                <DrawerItem name="">
                  <YamlDump data={input} />
                </DrawerItem>
              </div>
            ))}
          </div>
        )}

        {object.spec?.resources && object.spec.resources.length > 0 && (
          <>
            <DrawerTitle>Resources</DrawerTitle>
            {object.spec.resources?.map((resource, index) => (
              <>
                <div className={styles.title}>
                  <Icon small material="list" /> {index + 1}
                </div>
                <YamlDump data={resource} />
              </>
            ))}
          </>
        )}

        <DrawerItem name="Resources Template" hidden={!object.spec?.resourcesTemplate}>
          <YamlDump data={object.spec?.resourcesTemplate} />
        </DrawerItem>

        <StatusInventory inventory={object.status?.inventory} object={object} />

        <StatusHistory history={object.status?.history} />
      </>
    );
  },
);
