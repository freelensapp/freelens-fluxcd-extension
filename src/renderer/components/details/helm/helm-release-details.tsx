import { Common, Renderer } from "@freelensapp/extensions";
import crypto from "crypto";
import { Base64 } from "js-base64";
import yaml from "js-yaml";
import React, { useEffect, useState } from "react";
import { HelmRelease, HelmReleaseSnapshot } from "../../../k8s/fluxcd/helm/helmrelease";
import { defaultYamlDumpOptions, getHeight, getMaybeDetailsUrl } from "../../../utils";
import { MaybeLink } from "../../maybe-link";
import styleInline from "./helm-release-details.scss?inline";

const {
  Component: { DrawerItem, DrawerTitle, Icon, MonacoEditor, Table, TableCell, TableHead, TableRow, Tooltip },
  K8sApi: { configMapApi, namespacesApi, secretsApi, serviceAccountsApi },
} = Renderer;

const {
  Util: { stopPropagation },
} = Common;

export const HelmReleaseDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<HelmRelease>> = (props) => {
  const { object } = props;
  const [valuesFromYaml, setValuesFromYaml] = useState<Record<string, string | undefined>>({});

  const namespace = object.metadata.namespace ?? "default";

  const getChartRefNamespace = (object: HelmRelease) => {
    return object.spec.chart?.spec.sourceRef.namespace ?? object.spec.chartRef?.namespace ?? object.getNs()!;
  };

  const getHelmChartName = (object: HelmRelease) => {
    const ns = getChartRefNamespace(object);
    return `${ns}-${object.metadata.name}`;
  };

  const getHelmReleaseUrl = (object: HelmRelease) => {
    return `/helm/releases/${object.spec.storageNamespace ?? namespace}/${releaseName}`;
  };

  const getReleaseName = (object: HelmRelease) => {
    if (object.spec.releaseName !== undefined) {
      return object.spec.releaseName;
    }
    if (object.spec.targetNamespace !== undefined) {
      return `${object.spec.targetNamespace}-${object.metadata.name}`;
    }
    return object.metadata.name;
  };

  const getReleaseNameShortened = (object: HelmRelease) => {
    const name = getReleaseName(object);
    if (name.length > 53) {
      const hash = crypto.createHash("sha256").update(name).digest("hex").slice(0, 12);
      return `${name.slice(0, 40)}-${hash}`;
    }
    return name;
  };

  const getSourceRefUrl = (object: HelmRelease): string | undefined => {
    const ref = object.spec.chart?.spec.sourceRef ?? object.spec.chartRef;
    if (!ref) return;
    return Renderer.K8sApi.apiManager.lookupApiLink(ref, object);
  };

  const getHelmChartUrl = (object: HelmRelease): string | undefined => {
    if (!object.spec.chart?.spec.sourceRef) return;
    return Renderer.K8sApi.apiManager.lookupApiLink(object.spec.chart?.spec.sourceRef, object);
  };

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

  const releaseName = getReleaseNameShortened(object);
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
      <style>{styleInline}</style>
      <div className="HelmReleaseDetails">
        <DrawerItem name="Release Name">
          <MaybeLink key="link" to={getHelmReleaseUrl(object)} onClick={stopPropagation}>
            {releaseName}
          </MaybeLink>
        </DrawerItem>
        <DrawerItem name="Helm Chart" hidden={!object.spec.chart}>
          <MaybeLink key="link" to={getMaybeDetailsUrl(getHelmChartUrl(object))} onClick={stopPropagation}>
            {getHelmChartName(object)}
          </MaybeLink>
        </DrawerItem>
        <DrawerItem name="Chart Name">
          {object.status?.history?.[0]?.chartName ?? object.spec.chart?.spec.chart}
        </DrawerItem>
        <DrawerItem name="Chart Version">
          {object.status?.history?.[0]?.chartVersion ?? object.spec.chart?.spec.version}
        </DrawerItem>
        <DrawerItem name="App Version">{object.status?.history?.[0]?.appVersion}</DrawerItem>
        <DrawerItem name="Status" hidden={!object.status?.history?.[0]?.status}>
          {object.status?.history?.[0]?.status}
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
          <MaybeLink
            key="link"
            to={getMaybeDetailsUrl(
              serviceAccountsApi.formatUrlForNotListing({ name: object.spec.serviceAccountName, namespace }),
            )}
            onClick={stopPropagation}
          >
            {object.spec.serviceAccountName}
          </MaybeLink>
        </DrawerItem>
        <DrawerItem name="Storage Namespace" hidden={!object.spec.storageNamespace}>
          <MaybeLink
            key="link"
            to={getMaybeDetailsUrl(namespacesApi.formatUrlForNotListing({ name: object.spec.storageNamespace }))}
            onClick={stopPropagation}
          >
            {object.spec.storageNamespace}
          </MaybeLink>
        </DrawerItem>
        <DrawerItem name="Target Namespace" hidden={!object.spec.targetNamespace}>
          <MaybeLink
            key="link"
            to={getMaybeDetailsUrl(namespacesApi.formatUrlForNotListing({ name: object.spec.targetNamespace }))}
            onClick={stopPropagation}
          >
            {object.spec.targetNamespace}
          </MaybeLink>
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
          <MaybeLink to={getMaybeDetailsUrl(getSourceRefUrl(object))} onClick={stopPropagation}>
            {object.spec.chart?.spec.sourceRef.kind ?? object.spec.chartRef?.kind}
            {": "}
            {(object.spec.chart?.spec.sourceRef.namespace ?? object.spec.chartRef?.namespace)
              ? `${object.spec.chart?.spec.sourceRef.namespace ?? object.spec.chartRef?.namespace}/`
              : ""}
            {object.spec.chart?.spec.sourceRef.name ?? object.spec.chartRef?.name}
          </MaybeLink>
        </DrawerItem>
        <DrawerItem name="First Deployed" hidden={!object.status?.history?.[0].firstDeployed}>
          {object.status?.history?.[0].firstDeployed}
        </DrawerItem>
        <DrawerItem name="Last Deployed" hidden={!object.status?.history?.[0].lastDeployed}>
          {object.status?.history?.[0].lastDeployed}
        </DrawerItem>
        <DrawerItem name="Last Message" hidden={!object.status?.conditions?.[0].message}>
          {object.status?.conditions?.[0].message}
        </DrawerItem>

        {object.spec.valuesFrom && (
          <div className="HelmReleaseValuesFrom">
            <DrawerTitle>Values From</DrawerTitle>
            {object.spec.valuesFrom.map((valueFrom) => {
              const api = valueFrom.kind.toLowerCase() === "secret" ? secretsApi : configMapApi;
              const name = valueFrom.name;
              const valuesKey = valueFrom.valuesKey ?? "values.yaml";
              const valuesYamlValue = valuesFromYaml[`${namespace}/${name}/${valuesKey}`] ?? "";

              return (
                <div key={name} className="valueFrom">
                  <div className="title flex gaps">
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
                  <div className="flex column gaps">
                    <MonacoEditor
                      readOnly
                      id={`valuesFrom-${namespace}-${name}-${valuesKey}`}
                      style={{
                        minHeight: getHeight(valuesYamlValue),
                        resize: "none",
                        overflow: "hidden",
                        border: "1px solid var(--borderFaintColor)",
                        borderRadius: "4px",
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
                </div>
              );
            })}
          </div>
        )}

        {object.spec.values && (
          <div className="HelmReleaseValues">
            <DrawerTitle>Values</DrawerTitle>
            <div className="flex column gaps">
              <MonacoEditor
                readOnly
                id="values"
                style={{
                  minHeight: getHeight(valuesYaml),
                  resize: "none",
                  overflow: "hidden",
                  border: "1px solid var(--borderFaintColor)",
                  borderRadius: "4px",
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
          </div>
        )}

        {patches && (
          <div className="HelmReleasePatches">
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
                <div key={key} className="patch">
                  <div className="title flex gaps">
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
                  <div className="DrawerItem">
                    <span className="name">Patch</span>
                  </div>
                  <div className="flex column gaps">
                    <MonacoEditor
                      readOnly
                      id={`patch-${key}`}
                      style={{
                        minHeight: getHeight(patch.patch),
                        resize: "none",
                        overflow: "hidden",
                        border: "1px solid var(--borderFaintColor)",
                        borderRadius: "4px",
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
                </div>
              );
            })}
          </div>
        )}

        {images && (
          <div className="HelmReleaseImages">
            <DrawerTitle>Images</DrawerTitle>
            {images.map((image, idx) => {
              if (!image) return null;
              return (
                <div className="image" key={image.name ?? idx}>
                  <div className="title flex gaps">
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
          <div className="HelmReleaseHistory flex column">
            <DrawerTitle>History</DrawerTitle>
            <Table
              selectable
              tableId="history"
              scrollable={false}
              sortable={{
                version: (snapshot: HelmReleaseSnapshot) => snapshot.version,
                lastDeployed: (snapshot: HelmReleaseSnapshot) => snapshot.lastDeployed,
                chartVersion: (snapshot: HelmReleaseSnapshot) => snapshot.chartVersion,
                appVersion: (snapshot: HelmReleaseSnapshot) => snapshot.appVersion,
                status: (snapshot: HelmReleaseSnapshot) => snapshot.status,
              }}
              sortByDefault={{ sortBy: "version", orderBy: "desc" }}
              sortSyncWithUrl={false}
              className="box grow"
            >
              <TableHead flat sticky={false}>
                <TableCell className="version" sortBy="version">
                  Version
                </TableCell>
                <TableCell className="lastDeployed" sortBy="lastDeployed">
                  Last Deployed
                </TableCell>
                <TableCell className="chartVersion" sortBy="chartVersion">
                  Chart Version
                </TableCell>
                <TableCell className="appVersion" sortBy="appVersion">
                  App Version
                </TableCell>
                <TableCell className="status" sortBy="status">
                  Status
                </TableCell>
              </TableHead>
              {object.status?.history?.map((snapshot) => (
                <TableRow key={snapshot.version} sortItem={snapshot} nowrap>
                  <TableCell className="version">{snapshot.version}</TableCell>
                  <TableCell className="lastDeployed">{snapshot.lastDeployed}</TableCell>
                  <TableCell className="chartVersion" id={`helmReleaseHistory-${snapshot.version}-chartVersion`}>
                    {snapshot.chartVersion}
                    <Tooltip targetId={`helmReleaseHistory-${snapshot.version}-chartVersion`}>
                      {snapshot.chartVersion}
                    </Tooltip>
                  </TableCell>
                  <TableCell className="appVersion" id={`helmReleaseHistory-${snapshot.version}-appVersion`}>
                    {snapshot.appVersion}{" "}
                    <Tooltip targetId={`helmReleaseHistory-${snapshot.version}-appVersion`}>
                      {snapshot.appVersion}
                    </Tooltip>
                  </TableCell>
                  <TableCell className="status">{snapshot.status}</TableCell>
                </TableRow>
              ))}
            </Table>
          </div>
        )}

        {object.status?.conditions && (
          <div className="HelmReleaseConditions">
            <DrawerTitle>Conditions</DrawerTitle>
            {object.status?.conditions?.map((condition, idx) => (
              <div className="condition" key={idx}>
                <div className="title flex gaps">
                  <Icon small material="list" />
                </div>
                <DrawerItem name="Last Transition Time">{condition.lastTransitionTime}</DrawerItem>
                <DrawerItem name="Reason">{condition.reason}</DrawerItem>
                <DrawerItem name="Status">{condition.status}</DrawerItem>
                <DrawerItem name="Type" hidden={!condition.type}>
                  {condition.type}
                </DrawerItem>
                <DrawerItem name="Message">{condition.message}</DrawerItem>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
