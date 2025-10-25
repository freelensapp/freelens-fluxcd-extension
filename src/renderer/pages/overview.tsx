import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { InfoPage } from "../components/info-page";
import { PieChart } from "../components/pie-chart";
import { HelmRelease as HelmRelease_v2 } from "../k8s/fluxcd/helm/helmrelease-v2";
import { HelmRelease as HelmRelease_v2beta1 } from "../k8s/fluxcd/helm/helmrelease-v2beta1";
import { HelmRelease as HelmRelease_v2beta2 } from "../k8s/fluxcd/helm/helmrelease-v2beta2";
import { ImagePolicy } from "../k8s/fluxcd/image/imagepolicy";
import { ImageRepository } from "../k8s/fluxcd/image/imagerepository";
import { ImageUpdateAutomation } from "../k8s/fluxcd/image/imageupdateautomation";
import { Kustomization as Kustomization_v1 } from "../k8s/fluxcd/kustomize/kustomization-v1";
import { Kustomization as Kustomization_v1beta1 } from "../k8s/fluxcd/kustomize/kustomization-v1beta1";
import { Kustomization as Kustomization_v1beta2 } from "../k8s/fluxcd/kustomize/kustomization-v1beta2";
import { Alert } from "../k8s/fluxcd/notification/alert";
import { Provider } from "../k8s/fluxcd/notification/provider";
import { Receiver } from "../k8s/fluxcd/notification/receiver";
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
  Component: { Events, NamespaceSelectFilter, TabLayout },
} = Renderer;

const {
  Util: { cssNames },
} = Common;

function filterItems(items: Renderer.K8sApi.KubeEvent[]): Renderer.K8sApi.KubeEvent[] {
  const events = items.filter((event) => {
    return event?.involvedObject?.apiVersion?.includes(".toolkit.fluxcd.io/");
  });
  return events;
}

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

        const namespaceStore = Renderer.K8sApi.namespaceStore;

        return (
          <div className={cssNames(styles.chartColumn, "column")} hidden={!store.getAllByNs([]).length}>
            <PieChart
              title={title}
              objects={store.items.filter((item) => namespaceStore?.contextNamespaces.includes(item.getNs()!))}
              crd={crd}
            />
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
      await namespaceStore.loadAll({ namespaces: [] });
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
        ImageUpdateAutomation,
        ImageRepository,
        ImagePolicy,
        Alert,
        Provider,
        Receiver,
      ]) {
        try {
          const store = object.getStore();
          if (!store) continue;
          await store.loadAll({ namespaces });
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
              {getChart(ImageRepository.crd.title, ImageRepository)}
              {getChart(ImagePolicy.crd.title, ImagePolicy)}
              {getChart(ImageUpdateAutomation.crd.title, ImageUpdateAutomation)}
              {getChart(Alert.crd.title, Alert)}
              {getChart(Provider.crd.title, Provider)}
              {getChart(Receiver.crd.title, Receiver)}
            </div>
          </div>

          <Events compact hideFilters filterItems={[filterItems]} compactLimit={1000} />
        </div>
      </TabLayout>
    </>
  );
});
