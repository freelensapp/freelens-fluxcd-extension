import { Renderer } from "@freelensapp/extensions";

import React from "react";

import { PieChart } from "../components/pie-chart";

const {
  Component: { Tooltip, KubeObjectListLayout },
} = Renderer;

class FluxEventsStore extends Renderer.K8sApi.KubeObjectStore<
  Renderer.K8sApi.KubeEvent,
  typeof Renderer.K8sApi.eventApi
> {
  api = Renderer.K8sApi.eventApi;

  protected filterItemsOnLoad(items: Renderer.K8sApi.KubeEvent[]): Renderer.K8sApi.KubeEvent[] {
    return items.filter((i) => FluxTypes.findIndex((ft) => i.involvedObject.kind === ft.kind) !== -1);
  }
}

const fluxEventsStore = new FluxEventsStore();

import { crdStore } from "../k8s/core/crd";
import { HelmRelease, helmReleaseStore } from "../k8s/fluxcd/helm/helmrelease";
import { Kustomization, kustomizationStore } from "../k8s/fluxcd/kustomization";
import { Bucket, bucketStore } from "../k8s/fluxcd/sources/bucket";
import { GitRepository, gitRepositoryStore } from "../k8s/fluxcd/sources/gitrepository";
import { HelmChart, helmChartStore } from "../k8s/fluxcd/sources/helmchart";
import { HelmRepository, helmRepositoryStore } from "../k8s/fluxcd/sources/helmrepository";

import style from "./fluxcd-dashboard.module.scss";
import styleInline from "./fluxcd-dashboard.module.scss?inline";

import { makeObservable } from "mobx";
import { observer } from "mobx-react";
import { KubeAge } from "../components/ui/kube-age";
import { ImagePolicy, imagePolicyStore } from "../k8s/fluxcd/image-automation/imagepolicy";
import { ImageRepository, imageRepositoryStore } from "../k8s/fluxcd/image-automation/imagerepository";
import {
  ImageUpdateAutomation,
  imageUpdateAutomationStore,
} from "../k8s/fluxcd/image-automation/imageupdateautomation";
import { Alert, alertStore } from "../k8s/fluxcd/notifications/alert";
import { Provider, providerStore } from "../k8s/fluxcd/notifications/provider";
import { Receiver, receiverStore } from "../k8s/fluxcd/notifications/receiver";
import { OCIRepository, ociRepositoryStore } from "../k8s/fluxcd/sources/ocirepository";

enum columnId {
  message = "message",
  namespace = "namespace",
  object = "object",
  type = "type",
  count = "count",
  source = "source",
  age = "age",
  lastSeen = "last-seen",
}

interface FluxCDDashboardState {
  kustomizations: Kustomization[];
  gitRepositories: GitRepository[];
  helmReleases: HelmRelease[];
  helmCharts: HelmChart[];
  helmRepositories: HelmRepository[];
  buckets: Bucket[];
  ociRepositories: OCIRepository[];
  imageRepositories: ImageRepository[];
  imagePolicies: ImagePolicy[];
  imageUpdateAutomations: ImageUpdateAutomation[];
  alerts: Alert[];
  providers: Provider[];
  receivers: Receiver[];
  crds: Renderer.K8sApi.CustomResourceDefinition[];

  selectedTableRowId: string;
}

@observer
export class FluxCDDashboard extends React.Component<{ extension: Renderer.LensExtension }, FluxCDDashboardState> {
  public readonly state: Readonly<FluxCDDashboardState> = {
    kustomizations: [],
    gitRepositories: [],
    helmReleases: [],
    helmCharts: [],
    helmRepositories: [],
    buckets: [],
    ociRepositories: [],
    imageRepositories: [],
    imagePolicies: [],
    imageUpdateAutomations: [],
    alerts: [],
    providers: [],
    receivers: [],
    crds: [],
    selectedTableRowId: "",
  };

  private readonly watches: (() => void)[] = [];
  private readonly abortController = new AbortController();

  constructor(props: { extension: Renderer.LensExtension }) {
    super(props);

    makeObservable(this);
  }

  componentWillUnmount(): void {
    this.abortController.abort();
    this.watches.forEach((w) => {
      w();
    });
    this.watches.splice(0, this.watches.length);
    this.watches.length = 0;
  }

  getCrd(kubeObject: Renderer.K8sApi.KubeObject): Renderer.K8sApi.CustomResourceDefinition | undefined {
    const { crds } = this.state;

    if (!kubeObject) {
      return;
    }

    if (!crds) {
      return;
    }

    return crds.find(
      (crd) => crd.spec.names.kind === kubeObject.kind && crd.spec.group === kubeObject.apiVersion.split("/")[0],
    );
  }

  getChart(title: string, objects: Renderer.K8sApi.KubeObject[]) {
    if (!objects || objects.length === 0) {
      return;
    }

    const crd = this.getCrd(objects[0]);
    if (!crd) {
      return;
    }

    return (
      <div className="column">
        <PieChart title={title} objects={objects} crd={crd} />
      </div>
    );
  }

  async componentDidMount() {
    crdStore.loadAll().then((l) => this.setState({ crds: l || [] }));
    [
      kustomizationStore,
      helmReleaseStore,
      gitRepositoryStore,
      helmChartStore,
      helmRepositoryStore,
      bucketStore,
      ociRepositoryStore,
      imageUpdateAutomationStore,
      imageRepositoryStore,
      imagePolicyStore,
      alertStore,
      providerStore,
      receiverStore,
    ].forEach((store) => {
      store.loadAll().then(() => this.watches.push(store.subscribe()));
    });
  }

  render() {
    if (this.state.crds.length === 0) {
      return <div>No Flux components found in the cluster</div>;
    }

    return (
      <>
        <style>{styleInline}</style>
        <Renderer.Component.TabLayout>
          <div className={style.fluxContent}>
            <header className={`flex gaps align-center ${style.pb3}`}>
              <h1>FluxCD Dashboard</h1>
            </header>

            {/* add all crd from flux here as chart  */}
            <div className={`grid grow align-center ${style.fluxWorkloads}`}>
              {this.getChart("Kustomizations", kustomizationStore.items)}
              {this.getChart("Helm releases", helmReleaseStore.items)}
              {this.getChart("Git Repositories", gitRepositoryStore.items)}
              {this.getChart("Helm Repositories", helmRepositoryStore.items)}
              {this.getChart("Helm Charts", helmChartStore.items)}
              {this.getChart("Buckets", bucketStore.items)}
              {this.getChart("OCI Repositories", ociRepositoryStore.items)}
              {this.getChart("Image Repositories", imageRepositoryStore.items)}
              {this.getChart("Image Policies", imagePolicyStore.items)}
              {this.getChart("Image Automations", imageUpdateAutomationStore.items)}
              {this.getChart("Alerts", alertStore.items)}
              {this.getChart("Providers", providerStore.items)}
              {this.getChart("Receivers", receiverStore.items)}
            </div>

            <KubeObjectListLayout
              className="Events"
              store={fluxEventsStore}
              tableProps={{
                sortSyncWithUrl: false,
                sortByDefault: {
                  sortBy: columnId.lastSeen,
                  orderBy: "asc",
                },
              }}
              isSelectable={false}
              getItems={() =>
                fluxEventsStore.contextItems
                  .filter(onlyFluxEvents)
                  .sort(
                    (a, b) =>
                      (new Date(b.lastTimestamp || 0).getTime() || 0) - (new Date(a.lastTimestamp || 0).getTime() || 0),
                  )
              }
              sortingCallbacks={{
                [columnId.namespace]: (event) => event.getNs(),
                [columnId.type]: (event) => event.type,
                [columnId.object]: (event) => event.involvedObject.name,
                [columnId.count]: (event) => event.count,
                [columnId.age]: (event) => -event.getCreationTimestamp(),
                [columnId.lastSeen]: (event) => (event.lastTimestamp ? -new Date(event.lastTimestamp).getTime() : 0),
              }}
              searchFilters={[
                (event) => event.getSearchFields(),
                (event) => event.message,
                (event) => event.getSource(),
                (event) => event.involvedObject.name,
              ]}
              renderHeaderTitle="Flux Events"
              renderTableHeader={[
                { title: "Type", className: "type", sortBy: columnId.type, id: columnId.type },
                { title: "Message", className: "message", id: columnId.message },
                { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
                { title: "Involved Object", className: "object", sortBy: columnId.object, id: columnId.object },
                { title: "Source", className: "source", id: columnId.source },
                { title: "Count", className: "count", sortBy: columnId.count, id: columnId.count },
                { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
                { title: "Last Seen", className: "last-seen", sortBy: columnId.lastSeen, id: columnId.lastSeen },
              ]}
              renderTableContents={(event) => {
                const { involvedObject, type, message } = event;
                const tooltipId = `message-${event.getId()}`;
                const isWarning = event.isWarning();

                return [
                  type,
                  {
                    className: isWarning ? "warning" : "",
                    title: (
                      <>
                        <span id={tooltipId}>{message}</span>
                        <Tooltip targetId={tooltipId} formatters={{ narrow: true, warning: isWarning }}>
                          {message}
                        </Tooltip>
                      </>
                    ),
                  },
                  event.getNs(),
                  <>{`${involvedObject.kind}: ${involvedObject.name}`}</>,
                  // </Link>,
                  event.getSource(),
                  event.count,
                  <KubeAge timestamp={event.getCreationTimestamp()} key={`date`} />,
                  <KubeAge timestamp={new Date(event.lastTimestamp || 0).getTime()} key={`time`} />,
                ];
              }}
            />
          </div>
        </Renderer.Component.TabLayout>
      </>
    );
  }
}

const FluxTypes = [
  {
    kind: "Kustomization",
    apiVersions: [
      "kustomize.toolkit.fluxcd.io/v1beta1",
      "kustomize.toolkit.fluxcd.io/v1beta2",
      "kustomize.toolkit.fluxcd.io/v1",
    ],
  },
  { kind: "HelmRelease", apiVersions: ["helm.toolkit.fluxcd.io/v2beta1"] },
  { kind: "GitRepository", apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"] },
  { kind: "HelmChart", apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"] },
  { kind: "HelmRepository", apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"] },
  { kind: "Bucket", apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"] },
  { kind: "OciRepository", apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"] },
  { kind: "ImagePolicy", apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"] },
  { kind: "ImageRepository", apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"] },
  {
    kind: "ImageUpdateAutomation",
    apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"],
  },
  { kind: "Alert", apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"] },
  { kind: "Provider", apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"] },
  { kind: "Receiver", apiVersions: ["source.toolkit.fluxcd.io/v1beta1", "source.toolkit.fluxcd.io/v1beta2"] },
];

function onlyFluxEvents(event: Renderer.K8sApi.KubeEvent) {
  return (
    FluxTypes.findIndex((ft) => {
      return ft.kind === event.involvedObject.kind && ft.apiVersions.includes(event.involvedObject.apiVersion);
    }) !== -1
  );
}
