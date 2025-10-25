import { Common, Renderer } from "@freelensapp/extensions";
import crypto from "crypto";
import { Base64 } from "js-base64";
import yaml from "js-yaml";
import { observer } from "mobx-react";
import { useEffect, useState } from "react";
import { HelmRelease, HelmReleaseSnapshot } from "../../../k8s/fluxcd/helm/helmrelease-v2";
import { createEnumFromKeys, defaultYamlDumpOptions, getHeight, getMaybeDetailsUrl } from "../../../utils";
import { DurationAbsoluteTimestamp } from "../../duration-absolute";
import { LinkToNamespace } from "../../link-to-namespace";
import { LinkToObject } from "../../link-to-object";
import { LinkToServiceAccount } from "../../link-to-service-account";
import { MaybeLink } from "../../maybe-link";
import styles from "./helm-release-details.module.scss";
import stylesInline from "./helm-release-details.module.scss?inline";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: {
    BadgeBoolean,
    DrawerItem,
    DrawerTitle,
    Icon,
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
  version: (snapshot: HelmReleaseSnapshot) => snapshot.version,
  lastDeployed: (snapshot: HelmReleaseSnapshot) => snapshot.lastDeployed,
  chartVersion: (snapshot: HelmReleaseSnapshot) => snapshot.chartVersion,
  appVersion: (snapshot: HelmReleaseSnapshot) => snapshot.appVersion,
  status: (snapshot: HelmReleaseSnapshot) => snapshot.status,
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

    useEffect(() => {
      let mounted = true;
      (async () => {
        const valuesFromYamlResult: Record<string, string | undefined> = {};
        const ns = object.getNs()!;
        for (const valueFrom of object.spec.valuesFrom ?? []) {
          const api = valueFrom.kind.toLowerCase() === "secret" ? secretsApi : configMapApi;
          const name = valueFrom.name;
          const valuesKey = valueFrom.valuesKey ?? "values.yaml";
          const valuesObject = await api.get({ name, namespace: ns });
          if (!valuesObject) continue;
          const valuesYaml = valuesObject?.data?.[valuesKey];
          if (!valuesYaml) continue;
          if (valueFrom.kind.toLowerCase() === "secret" && Base64.isValid(valuesYaml)) {
            valuesFromYamlResult[`${ns}/${name}/${valuesKey}`] = Base64.decode(valuesYaml);
          } else {
            valuesFromYamlResult[`${ns}/${name}/${valuesKey}`] = valuesYaml;
          }
        }
        if (mounted) setValuesFromYaml(valuesFromYamlResult);
      })();
      return () => {
        mounted = false;
      };
    }, [object]);

    const valuesYaml = yaml.dump(object.spec.values, defaultYamlDumpOptions);

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
      ?.flat();

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.details}>
          <DrawerItem name="Release Name">
            <MaybeLink key="link" to={HelmRelease.getHelmReleaseUrl(object, namespace)} onClick={stopPropagation}>
              {HelmRelease.getReleaseNameShortened(object)}
            </MaybeLink>
          </DrawerItem>
          <DrawerItem name="Helm Chart" hidden={!object.spec.chartRef}>
            <LinkToObject objectRef={object.spec.chartRef} object={object} />
          </DrawerItem>
          <DrawerItem name="Chart Name">
            {object.status?.history?.[0]?.chartName ?? object.spec.chart?.spec.chart}
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
          <DrawerItem name="Storage Namespace" hidden={!object.spec.storageNamespace}>
            <LinkToNamespace namespace={object.spec.storageNamespace} />
          </DrawerItem>
          <DrawerItem name="Target Namespace" hidden={!object.spec.targetNamespace}>
            <LinkToNamespace namespace={object.spec.targetNamespace} />
          </DrawerItem>
          <DrawerItem name="Drift Detection" hidden={!object.spec.driftDetection?.mode}>
            {object.spec.driftDetection?.mode}
          </DrawerItem>
          <DrawerItem name="Install CRDs" hidden={!object.spec.install?.crds}>
            {object.spec.install?.crds}
          </DrawerItem>
          <DrawerItem name="Upgrade CRDs" hidden={!object.spec.upgrade?.crds}>
            {object.spec.upgrade?.crds}
          </DrawerItem>
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

          {object.spec.valuesFrom && (
            <div>
              <DrawerTitle>Values From</DrawerTitle>
              {object.spec.valuesFrom.map((valueFrom) => {
                const api = valueFrom.kind.toLowerCase() === "secret" ? secretsApi : configMapApi;
                const name = valueFrom.name;
                const valuesKey = valueFrom.valuesKey ?? "values.yaml";
                const valuesYamlValue = valuesFromYaml[`${namespace}/${name}/${valuesKey}`] ?? "";

                return (
                  <div key={name}>
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
                      {valueFrom.optional}
                    </DrawerItem>
                    <MonacoEditor
                      readOnly
                      id={`valuesFrom-${namespace}-${name}-${valuesKey}`}
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
                id="values"
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

          {patches && (
            <div>
              <DrawerTitle>Patches</DrawerTitle>
              {patches.map((patch) => {
                if (!patch) return null;
                const key = crypto
                  .createHash("sha256")
                  .update(
                    [
                      patch.patch,
                      patch.target?.kind,
                      patch.target?.name,
                      patch.target?.namespace,
                      patch.target?.labelSelector,
                      patch.target?.annotationSelector,
                    ].join(""),
                  )
                  .digest("hex");

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
          )}

          {images && (
            <div>
              <DrawerTitle>Images</DrawerTitle>
              {images.map((image, idx) => {
                if (!image) return null;
                return (
                  <div key={image.name ?? idx}>
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
                  <TableRow key={snapshot.version} sortItem={snapshot} nowrap>
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
        </div>
      </>
    );
  },
);
