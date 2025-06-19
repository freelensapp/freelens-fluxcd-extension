import { Renderer } from "@freelensapp/extensions";
import { makeObservable } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { PieChart } from "../components/pie-chart";
import { crdStore } from "../k8s/core/crd";
import { type HelmRelease, helmReleaseStore } from "../k8s/fluxcd/helm/helmrelease";
import { type ImagePolicy, imagePolicyStore } from "../k8s/fluxcd/image-automation/imagepolicy";
import { type ImageRepository, imageRepositoryStore } from "../k8s/fluxcd/image-automation/imagerepository";
import {
  type ImageUpdateAutomation,
  imageUpdateAutomationStore,
} from "../k8s/fluxcd/image-automation/imageupdateautomation";
import { type Kustomization, kustomizationStore } from "../k8s/fluxcd/kustomization";
import { type Alert, alertStore } from "../k8s/fluxcd/notifications/alert";
import { type Provider, providerStore } from "../k8s/fluxcd/notifications/provider";
import { type Receiver, receiverStore } from "../k8s/fluxcd/notifications/receiver";
import { type Bucket, bucketStore } from "../k8s/fluxcd/sources/bucket";
import { type GitRepository, gitRepositoryStore } from "../k8s/fluxcd/sources/gitrepository";
import { type HelmChart, helmChartStore } from "../k8s/fluxcd/sources/helmchart";
import { type HelmRepository, helmRepositoryStore } from "../k8s/fluxcd/sources/helmrepository";
import { type OCIRepository, ociRepositoryStore } from "../k8s/fluxcd/sources/ocirepository";
import style from "./overview.module.scss";
import styleInline from "./overview.module.scss?inline";

const Events = (Renderer.Component as any).Events;

const namespaceApi = Renderer.K8sApi.apiManager.getApi(Renderer.K8sApi.Namespace.apiBase);
const namespaceStore =
  namespaceApi && (Renderer.K8sApi.apiManager.getStore(namespaceApi) as unknown as Renderer.K8sApi.NamespaceStore);

interface FluxCDOverviewState {
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
export class FluxCDOverview extends React.Component<{ extension: Renderer.LensExtension }, FluxCDOverviewState> {
  public readonly state: Readonly<FluxCDOverviewState> = {
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

  getCrd(store: Renderer.K8sApi.KubeObjectStore): Renderer.K8sApi.CustomResourceDefinition | undefined {
    const { crds } = this.state;

    if (!crds) {
      return;
    }

    return crds.find((crd) => crd.spec.names.kind === store.api.kind && crd.spec.group === store.api.apiGroup);
  }

  getChart(title: string, store: Renderer.K8sApi.KubeObjectStore<Renderer.K8sApi.KubeObject<any, any, any>>) {
    const crd = this.getCrd(store);

    // Display charts only if the store has items and the CRD is defined.
    // `getAllByNs` for empty namespaces list returns items from all namespaces.
    return (
      <div className={`column ${style.chartColumn}`} hidden={!store.getAllByNs([]).length}>
        <PieChart
          title={title}
          objects={store.items.filter((item) => namespaceStore?.contextNamespaces.includes(item.getNs()!))}
          crd={crd}
        />
      </div>
    );
  }

  async componentDidMount() {
    const crds = (await crdStore.loadAll()) || [];
    this.setState({ crds });

    if (!namespaceStore) {
      console.warn("Namespace store not found, FluxCD overview may not work correctly.");
      return;
    }

    await namespaceStore.loadAll({ namespaces: [] });
    this.watches.push(namespaceStore.subscribe());

    // The explicit list of namespaces is required to avoid loading items only
    // from the current namespace.
    const namespaces = namespaceStore.items.map((ns) => ns.getName());
    console.log({ namespaces });

    for (const store of [
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
    ]) {
      if (store) {
        await store.loadAll({ namespaces });
        this.watches.push(store.subscribe());
      }
    }
  }

  render() {
    if (this.state.crds.length === 0) {
      return <div>No Flux components found in the cluster</div>;
    }

    return (
      <>
        <style>{styleInline}</style>
        <Renderer.Component.TabLayout className={style.fluxOverview}>
          <div className={style.fluxContent}>
            <header className={`flex gaps align-center ${style.pb3}`}>
              <h5 className="box grow">FluxCD Overview</h5>
              <Renderer.Component.NamespaceSelectFilter id="overview-namespace-select-filter-input" />
            </header>

            {/* add all crd from flux here as chart  */}
            <div className={style.overviewStatuses}>
              <div className={`grid grow align-center ${style.statuses}`}>
                {this.getChart("Kustomizations", kustomizationStore)}
                {this.getChart("Helm releases", helmReleaseStore)}
                {this.getChart("Git Repositories", gitRepositoryStore)}
                {this.getChart("Helm Repositories", helmRepositoryStore)}
                {this.getChart("Helm Charts", helmChartStore)}
                {this.getChart("Buckets", bucketStore)}
                {this.getChart("OCI Repositories", ociRepositoryStore)}
                {this.getChart("Image Repositories", imageRepositoryStore)}
                {this.getChart("Image Policies", imagePolicyStore)}
                {this.getChart("Image Automations", imageUpdateAutomationStore)}
                {this.getChart("Alerts", alertStore)}
                {this.getChart("Providers", providerStore)}
                {this.getChart("Receivers", receiverStore)}
              </div>
            </div>

            <Events ts className="box grow" compact hideFilters filterItems={[filterItems]} />
          </div>
        </Renderer.Component.TabLayout>
      </>
    );
  }
}

function filterItems(items: Renderer.K8sApi.KubeEvent[]): Renderer.K8sApi.KubeEvent[] {
  return items.filter((event) => {
    return event.involvedObject.apiVersion.includes(".toolkit.fluxcd.io/");
  });
}
