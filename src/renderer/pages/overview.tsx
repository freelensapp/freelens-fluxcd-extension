import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { useCallback, useEffect, useState } from "react";
import { FluxCDEvents } from "../components/fluxcd-events";
import { InfoPage } from "../components/info-page";
import { PieChart } from "../components/pie-chart";
import { ResourceSet as ResourceSet_v1 } from "../k8s/fluxcd/controlplane/resourceset-v1";
import { ResourceSetInputProvider as ResourceSetInputProvider_v1 } from "../k8s/fluxcd/controlplane/resourcesetinputprovider-v1";
import { HelmRelease as HelmRelease_v2 } from "../k8s/fluxcd/helm/helmrelease-v2";
import { HelmRelease as HelmRelease_v2beta1 } from "../k8s/fluxcd/helm/helmrelease-v2beta1";
import { HelmRelease as HelmRelease_v2beta2 } from "../k8s/fluxcd/helm/helmrelease-v2beta2";
import { ImagePolicy as ImagePolicy_v1 } from "../k8s/fluxcd/image/imagepolicy-v1";
import { ImagePolicy as ImagePolicy_v1beta1 } from "../k8s/fluxcd/image/imagepolicy-v1beta1";
import { ImagePolicy as ImagePolicy_v1beta2 } from "../k8s/fluxcd/image/imagepolicy-v1beta2";
import { ImageRepository as ImageRepository_v1 } from "../k8s/fluxcd/image/imagerepository-v1";
import { ImageRepository as ImageRepository_v1beta1 } from "../k8s/fluxcd/image/imagerepository-v1beta1";
import { ImageRepository as ImageRepository_v1beta2 } from "../k8s/fluxcd/image/imagerepository-v1beta2";
import { ImageUpdateAutomation as ImageUpdateAutomation_v1 } from "../k8s/fluxcd/image/imageupdateautomation-v1";
import { ImageUpdateAutomation as ImageUpdateAutomation_v1beta1 } from "../k8s/fluxcd/image/imageupdateautomation-v1beta1";
import { ImageUpdateAutomation as ImageUpdateAutomation_v1beta2 } from "../k8s/fluxcd/image/imageupdateautomation-v1beta2";
import { Kustomization as Kustomization_v1 } from "../k8s/fluxcd/kustomize/kustomization-v1";
import { Kustomization as Kustomization_v1beta1 } from "../k8s/fluxcd/kustomize/kustomization-v1beta1";
import { Kustomization as Kustomization_v1beta2 } from "../k8s/fluxcd/kustomize/kustomization-v1beta2";
import { Alert as Alert_v1beta1 } from "../k8s/fluxcd/notification/alert-v1beta1";
import { Alert as Alert_v1beta2 } from "../k8s/fluxcd/notification/alert-v1beta2";
import { Alert as Alert_v1beta3 } from "../k8s/fluxcd/notification/alert-v1beta3";
import { Provider as Provider_v1beta1 } from "../k8s/fluxcd/notification/provider-v1beta1";
import { Provider as Provider_v1beta2 } from "../k8s/fluxcd/notification/provider-v1beta2";
import { Provider as Provider_v1beta3 } from "../k8s/fluxcd/notification/provider-v1beta3";
import { Receiver as Receiver_v1 } from "../k8s/fluxcd/notification/receiver-v1";
import { Receiver as Receiver_v1beta1 } from "../k8s/fluxcd/notification/receiver-v1beta1";
import { Receiver as Receiver_v1beta2 } from "../k8s/fluxcd/notification/receiver-v1beta2";
import { Receiver as Receiver_v1beta3 } from "../k8s/fluxcd/notification/receiver-v1beta3";
import { Bucket as Bucket_v1 } from "../k8s/fluxcd/source/bucket-v1";
import { Bucket as Bucket_v1beta1 } from "../k8s/fluxcd/source/bucket-v1beta1";
import { Bucket as Bucket_v1beta2 } from "../k8s/fluxcd/source/bucket-v1beta2";
import { GitRepository as GitRepository_v1 } from "../k8s/fluxcd/source/gitrepository-v1";
import { GitRepository as GitRepository_v1beta1 } from "../k8s/fluxcd/source/gitrepository-v1beta1";
import { GitRepository as GitRepository_v1beta2 } from "../k8s/fluxcd/source/gitrepository-v1beta2";
import { HelmChart as HelmChart_v1 } from "../k8s/fluxcd/source/helmchart-v1";
import { HelmChart as HelmChart_v1beta1 } from "../k8s/fluxcd/source/helmchart-v1beta1";
import { HelmChart as HelmChart_v1beta2 } from "../k8s/fluxcd/source/helmchart-v1beta2";
import { HelmRepository as HelmRepository_v1 } from "../k8s/fluxcd/source/helmrepository-v1";
import { HelmRepository as HelmRepository_v1beta1 } from "../k8s/fluxcd/source/helmrepository-v1beta1";
import { HelmRepository as HelmRepository_v1beta2 } from "../k8s/fluxcd/source/helmrepository-v1beta2";
import { OCIRepository as OCIRepository_v1 } from "../k8s/fluxcd/source/ocirepository-v1";
import { OCIRepository as OCIRepository_v1beta2 } from "../k8s/fluxcd/source/ocirepository-v1beta2";
import { getServedStore } from "../utils";
import styles from "./overview.module.scss";

const { observer } = MobxReact;

const {
  Component: { NamespaceSelectFilter, TabLayout },
} = Renderer;

/**
 * The kinds with a chart, in the order of the charts, each with its classes ordered newest API version first. Only
 * the first version the cluster serves is used (see `getServedStore`).
 */
const kinds = [
  { title: Kustomization_v1.crd.title, classes: [Kustomization_v1, Kustomization_v1beta2, Kustomization_v1beta1] },
  { title: HelmRelease_v2.crd.title, classes: [HelmRelease_v2, HelmRelease_v2beta2, HelmRelease_v2beta1] },
  { title: GitRepository_v1.crd.title, classes: [GitRepository_v1, GitRepository_v1beta2, GitRepository_v1beta1] },
  {
    title: HelmRepository_v1.crd.title,
    classes: [HelmRepository_v1, HelmRepository_v1beta2, HelmRepository_v1beta1],
  },
  { title: HelmChart_v1.crd.title, classes: [HelmChart_v1, HelmChart_v1beta2, HelmChart_v1beta1] },
  { title: Bucket_v1.crd.title, classes: [Bucket_v1, Bucket_v1beta2, Bucket_v1beta1] },
  { title: OCIRepository_v1.crd.title, classes: [OCIRepository_v1, OCIRepository_v1beta2] },
  {
    title: ImageRepository_v1.crd.title,
    classes: [ImageRepository_v1, ImageRepository_v1beta2, ImageRepository_v1beta1],
  },
  { title: ImagePolicy_v1.crd.title, classes: [ImagePolicy_v1, ImagePolicy_v1beta2, ImagePolicy_v1beta1] },
  {
    title: ImageUpdateAutomation_v1.crd.title,
    classes: [ImageUpdateAutomation_v1, ImageUpdateAutomation_v1beta2, ImageUpdateAutomation_v1beta1],
  },
  { title: Alert_v1beta3.crd.title, classes: [Alert_v1beta3, Alert_v1beta2, Alert_v1beta1] },
  { title: Provider_v1beta3.crd.title, classes: [Provider_v1beta3, Provider_v1beta2, Provider_v1beta1] },
  { title: Receiver_v1.crd.title, classes: [Receiver_v1, Receiver_v1beta3, Receiver_v1beta2, Receiver_v1beta1] },
  { title: ResourceSet_v1.crd.title, classes: [ResourceSet_v1] },
  { title: ResourceSetInputProvider_v1.crd.title, classes: [ResourceSetInputProvider_v1] },
];

export interface FluxCDOverviewPageProps {
  extension: Renderer.LensExtension;
}

export const FluxCDOverviewPage = observer(({ extension }: FluxCDOverviewPageProps) => {
  const [crds, setCrds] = useState<Renderer.K8sApi.CustomResourceDefinition[]>([]);
  const [namespaces, setNamespaces] = useState<string[]>();

  // The page is an observer, so this is evaluated again when the host registers the APIs of the CRDs.
  const stores = kinds.map(({ title, classes }) => ({ title, store: getServedStore(classes) }));
  const storesKey = stores.map(({ store }) => store?.api.apiBase ?? "").join(",");

  const getCrd = useCallback(
    (store: Renderer.K8sApi.KubeObjectStore) => {
      return crds.find((crd) => crd.spec.names.kind === store.api.kind && crd.spec.group === store.api.apiGroup);
    },
    [crds],
  );

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();
    const watches: (() => void)[] = [];

    (async () => {
      const crdStore = Renderer.K8sApi.crdStore;
      const crds = (await crdStore.loadAll()) || [];
      if (!isMounted) return;
      setCrds(crds);

      const namespaceStore = Renderer.K8sApi.namespaceStore;
      await namespaceStore.loadAll({ namespaces: [], reqInit: { signal: abortController.signal } });
      if (!isMounted) return;
      watches.push(namespaceStore.subscribe());

      setNamespaces(namespaceStore.items.map((ns) => ns.getName()));
    })();

    return () => {
      isMounted = false;
      abortController.abort();
      watches.forEach((w) => w());
    };
  }, []);

  useEffect(() => {
    if (!namespaces) return;

    let isMounted = true;
    const abortController = new AbortController();
    const watches: (() => void)[] = [];

    (async () => {
      for (const { store } of stores) {
        if (!store) continue;
        try {
          await store.loadAll({ namespaces, reqInit: { signal: abortController.signal } });
          if (!isMounted) return;
          watches.push(store.subscribe());
        } catch {
          // not loaded, as when the page is left while loading: no chart for this kind
        }
      }
    })();

    return () => {
      isMounted = false;
      abortController.abort();
      watches.forEach((w) => w());
    };
  }, [namespaces, storesKey]);

  if (crds.length === 0) {
    return <InfoPage message="Loading Flux components..." />;
  }

  return (
    <TabLayout>
      <div className={styles.fluxContent}>
        <header>
          <h5>FluxCD Overview</h5>
          <NamespaceSelectFilter id="overview-namespace-select-filter-input" />
        </header>

        <div className={styles.overviewStatuses}>
          <div className={styles.statuses}>
            {stores.map(({ title, store }) => {
              if (!store) return null;
              const crd = getCrd(store);
              if (!crd) return null;

              const items = store.contextItems;
              if (!items.length) return null;

              return (
                <div key={title} className={styles.chartColumn}>
                  <PieChart extension={extension} title={title} objects={items} crd={crd} />
                </div>
              );
            })}
          </div>
        </div>

        <FluxCDEvents compact compactLimit={100} />
      </div>
    </TabLayout>
  );
});
