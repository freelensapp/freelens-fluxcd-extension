import { Common, Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { InfoPage } from "../components/info-page";
import { PieChart } from "../components/pie-chart";
import { HelmRelease } from "../k8s/fluxcd/helm/helmrelease";
import { ImagePolicy } from "../k8s/fluxcd/image/imagepolicy";
import { ImageRepository } from "../k8s/fluxcd/image/imagerepository";
import { ImageUpdateAutomation } from "../k8s/fluxcd/image/imageupdateautomation";
import { Kustomization_v1 } from "../k8s/fluxcd/kustomize/kustomization_v1";
import { Kustomization_v1beta1 } from "../k8s/fluxcd/kustomize/kustomization_v1beta1";
import { Kustomization_v1beta2 } from "../k8s/fluxcd/kustomize/kustomization_v1beta2";
import { Alert } from "../k8s/fluxcd/notification/alert";
import { Provider } from "../k8s/fluxcd/notification/provider";
import { Receiver } from "../k8s/fluxcd/notification/receiver";
import { Bucket } from "../k8s/fluxcd/source/bucket";
import { GitRepository } from "../k8s/fluxcd/source/gitrepository";
import { HelmChart } from "../k8s/fluxcd/source/helmchart";
import { HelmRepository } from "../k8s/fluxcd/source/helmrepository";
import { OCIRepository } from "../k8s/fluxcd/source/ocirepository";
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
        HelmRelease,
        GitRepository,
        HelmChart,
        HelmRepository,
        Bucket,
        OCIRepository,
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
              {getChart(HelmRelease.crd.title, HelmRelease)}
              {getChart(GitRepository.crd.title, GitRepository)}
              {getChart(HelmRepository.crd.title, HelmRepository)}
              {getChart(HelmChart.crd.title, HelmChart)}
              {getChart(Bucket.crd.title, Bucket)}
              {getChart(OCIRepository.crd.title, OCIRepository)}
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
