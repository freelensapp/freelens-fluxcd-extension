import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { useCallback, useEffect, useRef, useState } from "react";
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
import { ImageRepository as ImageRepository_v2 } from "../k8s/fluxcd/image/imagerepository-v1";
import { ImageRepository as ImageRepository_v2beta1 } from "../k8s/fluxcd/image/imagerepository-v1beta1";
import { ImageRepository as ImageRepository_v2beta2 } from "../k8s/fluxcd/image/imagerepository-v1beta2";
import { ImageUpdateAutomation as ImageUpdateAutomation_v2 } from "../k8s/fluxcd/image/imageupdateautomation-v1";
import { ImageUpdateAutomation as ImageUpdateAutomation_v2beta1 } from "../k8s/fluxcd/image/imageupdateautomation-v1beta1";
import { ImageUpdateAutomation as ImageUpdateAutomation_v2beta2 } from "../k8s/fluxcd/image/imageupdateautomation-v1beta2";
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
import styles from "./overview.module.scss";
import stylesInline from "./overview.module.scss?inline";

const {
  Component: { NamespaceSelectFilter, TabLayout },
} = Renderer;

const {
  Util: { cssNames },
} = Common;

export const FluxCDOverviewPage = observer(() => {
  const [crds, setCrds] = useState<Renderer.K8sApi.CustomResourceDefinition[]>([]);
  const watches = useRef<(() => void)[]>([]);
  const abortController = useRef(new AbortController());

  const getCrd = useCallback(
    (store: Renderer.K8sApi.KubeObjectStore) => {
      return crds.find((crd) => crd.spec.names.kind === store.api.kind && crd.spec.group === store.api.apiGroup);
    },
    [crds],
  );

  const getChart = useCallback(
    (title: string, resource: typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>) => {
      try {
        const store = resource.getStore();
        if (!store) return <></>;
        const crd = getCrd(store);
        if (!crd) return <></>;

        const items = store.contextItems;

        return (
          <div className={cssNames(styles.chartColumn, "column")} hidden={!items.length}>
            <PieChart title={title} objects={items} crd={crd} />
          </div>
        );
      } catch (_) {
        return null;
      }
    },
    [getCrd],
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      const crdStore = Renderer.K8sApi.crdStore;
      const crds = (await crdStore.loadAll()) || [];
      if (isMounted) setCrds(crds);

      const namespaceStore = Renderer.K8sApi.namespaceStore;
      await namespaceStore.loadAll({ namespaces: [], reqInit: { signal: abortController.current.signal } });
      watches.current.push(namespaceStore.subscribe());

      const namespaces = namespaceStore.items.map((ns) => ns.getName());

      for (const object of [
        Kustomization_v1beta1,
        Kustomization_v1beta2,
        Kustomization_v1,
        HelmRelease_v2beta1,
        HelmRelease_v2beta2,
        HelmRelease_v2,
        GitRepository_v1beta1,
        GitRepository_v1beta2,
        GitRepository_v1,
        HelmChart_v1beta1,
        HelmChart_v1beta2,
        HelmChart_v1,
        HelmRepository_v1beta1,
        HelmRepository_v1beta2,
        HelmRepository_v1,
        Bucket_v1beta1,
        Bucket_v1beta2,
        Bucket_v1,
        OCIRepository_v1beta2,
        OCIRepository_v1,
        ImageUpdateAutomation_v2beta1,
        ImageUpdateAutomation_v2beta2,
        ImageUpdateAutomation_v2,
        ImageRepository_v2beta1,
        ImageRepository_v2beta2,
        ImageRepository_v2,
        ImagePolicy_v1beta1,
        ImagePolicy_v1beta2,
        ImagePolicy_v1,
        Alert_v1beta1,
        Alert_v1beta2,
        Alert_v1beta3,
        Provider_v1beta1,
        Provider_v1beta2,
        Provider_v1beta3,
        Receiver_v1beta1,
        Receiver_v1beta2,
        Receiver_v1beta3,
        Receiver_v1,
        ResourceSet_v1,
        ResourceSetInputProvider_v1,
      ]) {
        try {
          const store = object.getStore();
          if (!store) continue;
          await store.loadAll({ namespaces, reqInit: { signal: abortController.current.signal } });
          watches.current.push(store.subscribe());
        } catch (_) {
          continue;
        }
      }
    })();

    return () => {
      isMounted = false;
      abortController.current.abort();
      watches.current.forEach((w) => w());
      watches.current = [];
    };
  }, []);

  if (crds.length === 0) {
    return <InfoPage message="Loading Flux components..." />;
  }

  return (
    <>
      <style>{stylesInline}</style>
      <TabLayout>
        <div className={styles.fluxContent}>
          <header>
            <h5>FluxCD Overview</h5>
            <NamespaceSelectFilter id="overview-namespace-select-filter-input" />
          </header>

          <div className={styles.overviewStatuses}>
            <div className={styles.statuses}>
              {getChart(Kustomization_v1beta1.crd.title, Kustomization_v1beta1)}
              {getChart(Kustomization_v1beta2.crd.title, Kustomization_v1beta2)}
              {getChart(Kustomization_v1.crd.title, Kustomization_v1)}
              {getChart(HelmRelease_v2beta1.crd.title, HelmRelease_v2beta1)}
              {getChart(HelmRelease_v2beta2.crd.title, HelmRelease_v2beta2)}
              {getChart(HelmRelease_v2.crd.title, HelmRelease_v2)}
              {getChart(GitRepository_v1beta1.crd.title, GitRepository_v1beta1)}
              {getChart(GitRepository_v1beta2.crd.title, GitRepository_v1beta2)}
              {getChart(GitRepository_v1.crd.title, GitRepository_v1)}
              {getChart(HelmRepository_v1beta1.crd.title, HelmRepository_v1beta1)}
              {getChart(HelmRepository_v1beta2.crd.title, HelmRepository_v1beta2)}
              {getChart(HelmRepository_v1.crd.title, HelmRepository_v1)}
              {getChart(HelmChart_v1beta1.crd.title, HelmChart_v1beta1)}
              {getChart(HelmChart_v1beta2.crd.title, HelmChart_v1beta2)}
              {getChart(HelmChart_v1.crd.title, HelmChart_v1)}
              {getChart(Bucket_v1beta1.crd.title, Bucket_v1beta1)}
              {getChart(Bucket_v1beta2.crd.title, Bucket_v1beta2)}
              {getChart(Bucket_v1.crd.title, Bucket_v1)}
              {getChart(OCIRepository_v1beta2.crd.title, OCIRepository_v1beta2)}
              {getChart(OCIRepository_v1.crd.title, OCIRepository_v1)}
              {getChart(ImageRepository_v2beta1.crd.title, ImageRepository_v2beta1)}
              {getChart(ImagePolicy_v1beta1.crd.title, ImagePolicy_v1beta1)}
              {getChart(ImageUpdateAutomation_v2beta1.crd.title, ImageUpdateAutomation_v2beta1)}
              {getChart(Alert_v1beta1.crd.title, Alert_v1beta1)}
              {getChart(Provider_v1beta1.crd.title, Provider_v1beta1)}
              {getChart(Receiver_v1beta1.crd.title, Receiver_v1beta1)}
              {getChart(ResourceSet_v1.crd.title, ResourceSet_v1)}
              {getChart(ResourceSetInputProvider_v1.crd.title, ResourceSetInputProvider_v1)}
            </div>
          </div>

          <FluxCDEvents compact compactLimit={100} />
        </div>
      </TabLayout>
    </>
  );
});
