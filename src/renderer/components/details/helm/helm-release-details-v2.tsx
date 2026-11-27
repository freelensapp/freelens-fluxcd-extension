import { Common, Renderer } from "@freelensapp/extensions";
import { Base64 } from "js-base64";
import { dump } from "js-yaml";
import * as MobxReact from "mobx-react";
import { useEffect, useState } from "react";
import { HelmRelease, type HelmReleaseStore, type Snapshot } from "../../../k8s/fluxcd/helm/helmrelease-v2";
import { withFluxKind, withServedApiVersion } from "../../../k8s/fluxcd/utils";
import {
  createEnumFromKeys,
  defaultYamlDumpOptions,
  getHeight,
  getMaybeDetailsUrl,
  getSourceData,
} from "../../../utils";
import { SpecPatches } from "../../spec-patches";
import { getConditionClass, getConditionText, getStatusMessage } from "../../status-conditions";
import { StatusInventory } from "../../status-inventory";
import { YamlDump } from "../../yaml-dump";
import {
  HelmReleaseInstall,
  HelmReleaseRollback,
  HelmReleaseTest,
  HelmReleaseUninstall,
  HelmReleaseUpgrade,
} from "./helm-release-actions-v2";
import { HelmReleaseChartVerification, HelmReleaseOCIRepositoryTemplate } from "./helm-release-chart-template-v2";
import styles from "./helm-release-details.module.scss";

import type { Patch } from "../../../k8s/core/types";

const { observer } = MobxReact;

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: {
    Badge,
    BadgeBoolean,
    DrawerItem,
    DrawerItemLabels,
    DrawerTitle,
    DurationAbsoluteTimestamp,
    Icon,
    LinkToConfigMap,
    LinkToNamespace,
    LinkToObject,
    LinkToSecret,
    LinkToServiceAccount,
    MaybeLink,
    MonacoEditor,
    Table,
    TableCell,
    TableHead,
    TableRow,
    WithTooltip,
  },
  K8sApi: { configMapApi, secretsApi },
} = Renderer;

const historySortable = {
  version: (snapshot: Snapshot) => snapshot.version,
  lastDeployed: (snapshot: Snapshot) => snapshot.lastDeployed,
  chartVersion: (snapshot: Snapshot) => snapshot.chartVersion,
  appVersion: (snapshot: Snapshot) => snapshot.appVersion,
  status: (snapshot: Snapshot) => snapshot.status,
};

const historySortByNames = createEnumFromKeys(historySortable);

const historySortByDefault: { sortBy: keyof typeof historySortable; orderBy: Renderer.Component.TableOrderBy } = {
  sortBy: historySortByNames.version,
  orderBy: "desc",
};

export const HelmReleaseDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<HelmRelease>> = observer(
  (props) => {
    const { object } = props;
    const [valuesFromYaml, setValuesFromYaml] = useState<Record<string, string | undefined>>({});

    const namespace = object.metadata.namespace ?? "default";
    const store = HelmRelease.getStore() as HelmReleaseStore;

    useEffect(() => {
      let mounted = true;
      (async () => {
        const valuesFromYamlResult: Record<string, string | undefined> = {};
        const ns = object.getNs()!;
        for (const valueFrom of object.spec.valuesFrom ?? []) {
          const api = valueFrom.kind.toLowerCase() === "secret" ? secretsApi : configMapApi;
          const name = valueFrom.name;
          const valuesKey = valueFrom.valuesKey ?? "values.yaml";
          const valuesYaml = (await getSourceData(api, name, ns))?.[valuesKey];
          if (!valuesYaml) continue;
          if (valueFrom.kind.toLowerCase() === "secret" && Base64.isValid(valuesYaml)) {
            valuesFromYamlResult[`${valueFrom.kind}/${name}/${valuesKey}`] = Base64.decode(valuesYaml);
          } else {
            valuesFromYamlResult[`${valueFrom.kind}/${name}/${valuesKey}`] = valuesYaml;
          }
        }
        if (mounted) setValuesFromYaml(valuesFromYamlResult);
      })();
      return () => {
        mounted = false;
      };
    }, [object]);

    const valuesYaml = dump(object.spec.values, defaultYamlDumpOptions);

    const chartTemplateKind = HelmRelease.getChartTemplateKind(object);
    const chartTemplateRef = HelmRelease.getChartTemplateRef(object);
    const chartName = object.status?.history?.[0]?.chartName ?? object.spec.chart?.spec.chart;
    const chartOciRef = object.spec.chart?.spec.ref;
    // The field that takes precedence: the digest, then the semver range, then the tag.
    const chartOciRefText =
      (chartOciRef?.digest && `digest: ${chartOciRef.digest}`) ||
      (chartOciRef?.semver && `semver: ${chartOciRef.semver}`) ||
      (chartOciRef?.tag && `tag: ${chartOciRef.tag}`) ||
      undefined;

    const kubeConfigSecretRef = object.spec.kubeConfig?.secretRef;
    const kubeConfigConfigMapName = object.spec.kubeConfig?.configMapRef?.name;

    const images = object.spec.postRenderers
      ?.filter((a) => a?.kustomize)
      ?.map((a) => a?.kustomize)
      ?.filter((a) => a?.images)
      ?.map((a) => a?.images)
      ?.flat();

    const patches = object.spec.postRenderers
      ?.filter((a) => a?.kustomize)
      ?.map((a) => a?.kustomize)
      ?.filter((a) => a?.patches)
      ?.map((a) => a?.patches)
      ?.flat() as Patch[] | undefined;

    return (
      <>
        <div className={styles.details}>
          <DrawerItem name="Release Name">
            <MaybeLink key="link" to={HelmRelease.getHelmReleaseUrl(object, namespace)} onClick={stopPropagation}>
              {HelmRelease.getReleaseNameShortened(object)}
            </MaybeLink>
          </DrawerItem>
          <DrawerItem name="Helm Chart" hidden={!object.spec.chartRef}>
            <LinkToObject objectRef={withServedApiVersion(object.spec.chartRef)} object={object} />
          </DrawerItem>
          <DrawerItem name="Chart Kind" hidden={!chartTemplateKind}>
            {chartTemplateKind}
          </DrawerItem>
          <DrawerItem name="Generated Object" hidden={!chartTemplateRef}>
            <LinkToObject objectRef={withServedApiVersion(chartTemplateRef)} object={object} />
          </DrawerItem>
          <DrawerItem name="Chart URL" hidden={!object.spec.chart?.spec.url}>
            {object.spec.chart?.spec.url}
          </DrawerItem>
          <DrawerItem name="Chart Reference" hidden={!chartOciRefText}>
            {chartOciRefText}
          </DrawerItem>
          <DrawerItem name="Chart Name" hidden={!chartName}>
            {chartName}
          </DrawerItem>
          <DrawerItem name="Chart Version">
            {object.status?.history?.[0]?.chartVersion ?? object.spec.chart?.spec.version}
          </DrawerItem>
          <DrawerItem name="App Version">{object.status?.history?.[0]?.appVersion}</DrawerItem>
          <DrawerItem name="History Last Status" hidden={!object.status?.history?.[0]?.status}>
            {object.status?.history?.[0]?.status}
          </DrawerItem>
          <DrawerItem name="Resumed">
            <BadgeBoolean value={!object.spec.suspend} />
          </DrawerItem>
          <DrawerItem name="Chart Interval" hidden={!object.spec.chart?.spec.interval}>
            {object.spec.chart?.spec.interval}
          </DrawerItem>
          <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
          <DrawerItem name="Max History" hidden={!object.spec.maxHistory}>
            {object.spec.maxHistory}
          </DrawerItem>
          <DrawerItem name="Timeout" hidden={!object.spec.timeout}>
            {object.spec.timeout}
          </DrawerItem>
          <DrawerItem name="Service Account" hidden={!object.spec.serviceAccountName}>
            <LinkToServiceAccount name={object.spec.serviceAccountName} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="Kube Config" hidden={!kubeConfigSecretRef && !kubeConfigConfigMapName}>
            {kubeConfigSecretRef && <LinkToSecret name={kubeConfigSecretRef.name} namespace={namespace} />}
            {kubeConfigConfigMapName && <LinkToConfigMap name={kubeConfigConfigMapName} namespace={namespace} />}
          </DrawerItem>
          {/* The key of the Secret defaults to `value` (`meta.KubeConfigReference`). */}
          <DrawerItem name="Kube Config Key" hidden={!kubeConfigSecretRef}>
            {kubeConfigSecretRef?.key ?? "value"}
          </DrawerItem>
          <DrawerItem name="Persistent Client" hidden={object.spec.persistentClient === undefined}>
            <BadgeBoolean value={object.spec.persistentClient ?? true} />
          </DrawerItem>
          <DrawerItem name="Storage Namespace" hidden={!object.spec.storageNamespace}>
            <LinkToNamespace namespace={object.spec.storageNamespace} />
          </DrawerItem>
          <DrawerItem name="Target Namespace" hidden={!object.spec.targetNamespace}>
            <LinkToNamespace namespace={object.spec.targetNamespace} />
          </DrawerItem>
          <DrawerItem name="Drift Detection" hidden={!object.spec.driftDetection?.mode}>
            {object.spec.driftDetection?.mode}
          </DrawerItem>
          <DrawerItem name="Wait Strategy" hidden={!object.spec.waitStrategy}>
            {object.spec.waitStrategy?.name}
          </DrawerItem>
          <DrawerItem name="Post Render Strategy" hidden={!object.spec.postRenderStrategy}>
            {object.spec.postRenderStrategy}
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
          <DrawerItem name="Values Files" hidden={!object.spec.chart?.spec.valuesFiles?.length}>
            {object.spec.chart?.spec.valuesFiles?.join(", ")}
          </DrawerItem>
          <DrawerItem name="Ignore Missing Values Files" hidden={!object.spec.chart?.spec.ignoreMissingValuesFiles}>
            <BadgeBoolean value={object.spec.chart?.spec.ignoreMissingValuesFiles ?? false} />
          </DrawerItem>
          {/* `ChartVersion` by default; an `OCIRepository` template does not have it. */}
          <DrawerItem name="Chart Reconcile Strategy" hidden={chartTemplateKind !== "HelmChart"}>
            {object.spec.chart?.spec.reconcileStrategy ?? "ChartVersion"}
          </DrawerItem>
          <DrawerItemLabels
            name="Chart Labels"
            labels={object.spec.chart?.metadata?.labels ?? {}}
            hidden={!object.spec.chart?.metadata?.labels}
          />
          <DrawerItemLabels
            name="Chart Annotations"
            labels={object.spec.chart?.metadata?.annotations ?? {}}
            hidden={!object.spec.chart?.metadata?.annotations}
          />
          <DrawerItem name="Source">
            <MaybeLink to={getMaybeDetailsUrl(HelmRelease.getSourceRefUrl(object))} onClick={stopPropagation}>
              {HelmRelease.getSourceRefText(object)}
            </MaybeLink>
          </DrawerItem>
          <DrawerItem name="First Deployed" hidden={!object.status?.history?.[0].firstDeployed}>
            <DurationAbsoluteTimestamp timestamp={object.status?.history?.[0].firstDeployed} />
          </DrawerItem>
          <DrawerItem name="Last Deployed" hidden={!object.status?.history?.[0].lastDeployed}>
            <DurationAbsoluteTimestamp timestamp={object.status?.history?.[0].lastDeployed} />
          </DrawerItem>
          <DrawerItem name="Last Message" hidden={!object.status?.conditions?.[0].message}>
            {object.status?.conditions?.[0].message}
          </DrawerItem>

          <HelmReleaseOCIRepositoryTemplate object={object} />
          <HelmReleaseChartVerification object={object} />

          {object.spec.dependsOn && (
            <div>
              <DrawerTitle>Depends On</DrawerTitle>
              {object.spec.dependsOn.map((dependency) => {
                const reference = store.getByName(dependency.name, dependency.namespace ?? namespace);
                return (
                  <div className="dependency" key={dependency.name + (dependency.namespace ?? "")}>
                    <div className={styles.title}>
                      <Icon small material="list" />
                    </div>

                    <DrawerItem name="Name">
                      <LinkToObject objectRef={withFluxKind(dependency, HelmRelease.kind)} object={object} />
                    </DrawerItem>
                    <DrawerItem name="Namespace">
                      <LinkToNamespace namespace={dependency.namespace ?? namespace} />
                    </DrawerItem>
                    <DrawerItem name="Ready Expression" hidden={!dependency.readyExpr}>
                      <YamlDump data={dependency.readyExpr} />
                    </DrawerItem>
                    <DrawerItem name="Chart Version" hidden={!reference?.status?.history?.[0]?.chartVersion}>
                      {reference?.status?.history?.[0]?.chartVersion}
                    </DrawerItem>
                    <DrawerItem name="Condition" hidden={!reference}>
                      {reference ? (
                        <Badge
                          className={getConditionClass(reference.status?.conditions, reference.spec.suspend)}
                          label={getConditionText(reference.status?.conditions, reference.spec.suspend)}
                        />
                      ) : (
                        ""
                      )}
                    </DrawerItem>
                    <DrawerItem name="Status" hidden={!reference}>
                      {reference && getStatusMessage(reference.status?.conditions)}
                    </DrawerItem>
                  </div>
                );
              })}
            </div>
          )}

          {object.spec.valuesFrom && (
            <div>
              <DrawerTitle>Values From</DrawerTitle>
              {object.spec.valuesFrom.map((valueFrom) => {
                const api = valueFrom.kind.toLowerCase() === "secret" ? secretsApi : configMapApi;
                const name = valueFrom.name;
                const valuesKey = valueFrom.valuesKey ?? "values.yaml";
                const valuesYamlValue = valuesFromYaml[`${valueFrom.kind}/${name}/${valuesKey}`] ?? "";

                return (
                  <div key={Renderer.Util.createReactKey(valueFrom)}>
                    <div className={styles.title}>
                      <Icon small material="list" />
                    </div>
                    <DrawerItem name="Kind">{valueFrom.kind}</DrawerItem>
                    <DrawerItem name="Name">
                      <MaybeLink
                        key="link"
                        to={getMaybeDetailsUrl(api.formatUrlForNotListing({ name, namespace }))}
                        onClick={stopPropagation}
                      >
                        {name}
                      </MaybeLink>
                    </DrawerItem>
                    <DrawerItem name="Values Key" hidden={!valueFrom.valuesKey}>
                      {valueFrom.valuesKey}
                    </DrawerItem>
                    <DrawerItem name="Target Path" hidden={!valueFrom.targetPath}>
                      {valueFrom.targetPath}
                    </DrawerItem>
                    <DrawerItem name="Optional" hidden={!valueFrom.optional}>
                      <BadgeBoolean value={valueFrom.optional ?? false} />
                    </DrawerItem>
                    <DrawerItem name="Literal" hidden={!valueFrom.literal}>
                      <BadgeBoolean value={valueFrom.literal ?? false} />
                    </DrawerItem>
                    <MonacoEditor
                      readOnly
                      className={styles.editor}
                      style={{
                        minHeight: getHeight(valuesYamlValue),
                      }}
                      value={valuesYamlValue}
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
          )}

          {object.spec.values && (
            <div>
              <DrawerTitle>Values</DrawerTitle>
              <MonacoEditor
                readOnly
                className={styles.editor}
                style={{
                  minHeight: getHeight(valuesYaml),
                }}
                value={valuesYaml}
                setInitialHeight
                options={{
                  scrollbar: {
                    alwaysConsumeMouseWheel: false,
                  },
                }}
              />
            </div>
          )}

          <SpecPatches patches={patches} />

          {images && (
            <div>
              <DrawerTitle>Images</DrawerTitle>
              {images.map((image) => {
                if (!image) return null;
                return (
                  <div key={image.name}>
                    <div className={styles.title}>
                      <Icon small material="list" />
                    </div>
                    <DrawerItem name="Name">{image.name}</DrawerItem>
                    <DrawerItem name="New Name" hidden={!image.newName}>
                      {image.newName}
                    </DrawerItem>
                    <DrawerItem name="New Tag" hidden={!image.newTag}>
                      {image.newTag}
                    </DrawerItem>
                    <DrawerItem name="Digest" hidden={!image.digest}>
                      {image.digest}
                    </DrawerItem>
                  </div>
                );
              })}
            </div>
          )}

          {object.spec.healthCheckExprs && (
            <div>
              <DrawerTitle>Health Check Expressions</DrawerTitle>
              {object.spec.healthCheckExprs.map((healthCheck) => (
                <div key={Renderer.Util.createReactKey(healthCheck)}>
                  <div className={styles.title}>
                    <Icon small material="list" />
                  </div>
                  <DrawerItem name="API Version">{healthCheck.apiVersion}</DrawerItem>
                  <DrawerItem name="Kind" hidden={!healthCheck.kind}>
                    {healthCheck.kind}
                  </DrawerItem>
                  <DrawerItem name="Current">
                    <YamlDump data={healthCheck.current} />
                  </DrawerItem>
                  <DrawerItem name="In Progress" hidden={!healthCheck.inProgress}>
                    <YamlDump data={healthCheck.inProgress} />
                  </DrawerItem>
                  <DrawerItem name="Failed" hidden={!healthCheck.failed}>
                    <YamlDump data={healthCheck.failed} />
                  </DrawerItem>
                </div>
              ))}
            </div>
          )}

          {object.spec.driftDetection?.ignore && (
            <div>
              <DrawerTitle>Drift Detection Ignore Rules</DrawerTitle>
              {object.spec.driftDetection.ignore.map((rule, index) => (
                <div key={Renderer.Util.createReactKey(rule)}>
                  <div className={styles.title}>
                    <Icon small material="list" /> {index + 1}
                  </div>
                  <DrawerItem name="Paths">{rule.paths.join(", ")}</DrawerItem>
                  {/* Without a target, the paths are ignored for every object of the release. */}
                  <DrawerItem name="Target">
                    {rule.target ? (
                      <>
                        <DrawerItem name="Group" hidden={!rule.target.group}>
                          {rule.target.group}
                        </DrawerItem>
                        <DrawerItem name="Version" hidden={!rule.target.version}>
                          {rule.target.version}
                        </DrawerItem>
                        <DrawerItem name="Kind" hidden={!rule.target.kind}>
                          {rule.target.kind}
                        </DrawerItem>
                        <DrawerItem name="Name" hidden={!rule.target.name}>
                          {rule.target.name}
                        </DrawerItem>
                        <DrawerItem name="Namespace" hidden={!rule.target.namespace}>
                          {rule.target.namespace}
                        </DrawerItem>
                        <DrawerItem name="Label Selector" hidden={!rule.target.labelSelector}>
                          {rule.target.labelSelector}
                        </DrawerItem>
                        <DrawerItem name="Annotation Selector" hidden={!rule.target.annotationSelector}>
                          {rule.target.annotationSelector}
                        </DrawerItem>
                      </>
                    ) : (
                      "all objects"
                    )}
                  </DrawerItem>
                </div>
              ))}
            </div>
          )}

          <HelmReleaseInstall install={object.spec.install} />
          <HelmReleaseUpgrade upgrade={object.spec.upgrade} />
          <HelmReleaseRollback rollback={object.spec.rollback} />
          <HelmReleaseTest test={object.spec.test} />
          <HelmReleaseUninstall uninstall={object.spec.uninstall} />

          {object.status?.history && (
            <div className={styles.history}>
              <DrawerTitle>History</DrawerTitle>
              <Table
                selectable
                tableId="history"
                scrollable={false}
                sortable={historySortable}
                sortByDefault={historySortByDefault}
                sortSyncWithUrl={false}
              >
                <TableHead flat sticky={false}>
                  <TableCell sortBy={historySortByNames.version} className={styles.version}>
                    Version
                  </TableCell>
                  <TableCell sortBy={historySortByNames.lastDeployed}>Last Deployed</TableCell>
                  <TableCell sortBy={historySortByNames.chartVersion}>Chart Version</TableCell>
                  <TableCell sortBy={historySortByNames.appVersion}>App Version</TableCell>
                  <TableCell sortBy={historySortByNames.status} className={styles.status}>
                    Status
                  </TableCell>
                </TableHead>
                {object.status?.history?.map((snapshot) => (
                  <TableRow key={`${snapshot.digest}-${snapshot.configDigest}`} sortItem={snapshot} nowrap>
                    <TableCell className={styles.version}>{snapshot.version}</TableCell>
                    <TableCell>{snapshot.lastDeployed}</TableCell>
                    <TableCell>
                      <WithTooltip>{snapshot.chartVersion}</WithTooltip>
                    </TableCell>
                    <TableCell>
                      <WithTooltip>{snapshot.appVersion}</WithTooltip>
                    </TableCell>
                    <TableCell className={styles.status}>{snapshot.status}</TableCell>
                  </TableRow>
                ))}
              </Table>
            </div>
          )}

          <StatusInventory inventory={object.status?.inventory} object={object} />
        </div>
      </>
    );
  },
);
