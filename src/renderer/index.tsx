import { Renderer } from "@freelensapp/extensions";
import { HelmReleaseDetails } from "./components/details/helm/helm-release-details";
import { ImagePolicyDetails } from "./components/details/image/image-policy-details";
import { ImageRepositoryDetails } from "./components/details/image/image-repository-details";
import { ImageUpdateAutomationDetails } from "./components/details/image/image-update-automation-details";
import { KustomizationDetails } from "./components/details/kustomize/kustomization-details";
import { AlertDetails } from "./components/details/notification/alert-details";
import { ProviderDetails } from "./components/details/notification/provider-details";
import { ReceiverDetails } from "./components/details/notification/receiver-details";
import { BucketDetails } from "./components/details/source/bucket-details";
import { GitRepositoryDetails } from "./components/details/source/git-repository-details";
import { HelmChartDetails } from "./components/details/source/helm-chart-details";
import { HelmRepositoryDetails } from "./components/details/source/helm-repository-details";
import { OCIRepositoryDetails } from "./components/details/source/oci-repository-details";
import svgIcon from "./icons/fluxcd.svg?raw";
import { HelmRelease } from "./k8s/fluxcd/helm/helmrelease";
import { ImagePolicy } from "./k8s/fluxcd/image/imagepolicy";
import { ImageRepository } from "./k8s/fluxcd/image/imagerepository";
import { ImageUpdateAutomation } from "./k8s/fluxcd/image/imageupdateautomation";
import { Kustomization } from "./k8s/fluxcd/kustomize/kustomization";
import { Alert } from "./k8s/fluxcd/notification/alert";
import { Provider } from "./k8s/fluxcd/notification/provider";
import { Receiver } from "./k8s/fluxcd/notification/receiver";
import { Bucket } from "./k8s/fluxcd/source/bucket";
import { GitRepository } from "./k8s/fluxcd/source/gitrepository";
import { HelmChart } from "./k8s/fluxcd/source/helmchart";
import { HelmRepository } from "./k8s/fluxcd/source/helmrepository";
import { OCIRepository } from "./k8s/fluxcd/source/ocirepository";
import {
  FluxCDObjectReconcileMenuItem,
  type FluxCDObjectReconcileMenuItemProps,
} from "./menus/fluxcd-object-reconcile-menu-item";
import {
  FluxCDObjectSuspendResumeMenuItem,
  type FluxCDObjectSuspendResumeMenuItemProps,
} from "./menus/fluxcd-object-suspend-resume-menu-item";
import { HelmReleasesPage } from "./pages/helm/helmreleases";
import { ImagePoliciesPage } from "./pages/image/imagepolicies";
import { ImageRepositoriesPage } from "./pages/image/imagerepositories";
import { ImageUpdateAutomationsPage } from "./pages/image/imageupdateautomations";
import { KustomizationsPage } from "./pages/kustomize/kustomizations";
import { AlertsPage } from "./pages/notifications/alerts";
import { ProvidersPage } from "./pages/notifications/providers";
import { ReceiversPage } from "./pages/notifications/receivers";
import { FluxCDOverview } from "./pages/overview";
import { BucketsPage } from "./pages/source/buckets";
import { GitRepositoriesPage } from "./pages/source/gitrepositories";
import { HelmChartsPage } from "./pages/source/helmcharts";
import { HelmRepositoriesPage } from "./pages/source/helmrepositories";
import { OCIRepositoriesPage } from "./pages/source/ocirepositories";

const {
  Component: { Icon },
} = Renderer;

export function FluxCDIcon(props: Renderer.Component.IconProps) {
  return <Icon {...props} svg={svgIcon} />;
}

export default class FluxCDExtension extends Renderer.LensExtension {
  clusterPages = [
    {
      id: "dashboard",
      components: {
        Page: () => <FluxCDOverview />,
      },
    },
    {
      id: Alert.crd.plural,
      components: {
        Page: () => <AlertsPage extension={this} />,
      },
    },
    {
      id: Bucket.crd.plural,
      components: {
        Page: () => <BucketsPage extension={this} />,
      },
    },
    {
      id: GitRepository.crd.plural,
      components: {
        Page: () => <GitRepositoriesPage extension={this} />,
      },
    },
    {
      id: HelmChart.crd.plural,
      components: {
        Page: () => <HelmChartsPage extension={this} />,
      },
    },
    {
      id: HelmRelease.crd.plural,
      components: {
        Page: () => <HelmReleasesPage extension={this} />,
      },
    },
    {
      id: HelmRepository.crd.plural,
      components: {
        Page: () => <HelmRepositoriesPage extension={this} />,
      },
    },
    {
      id: ImagePolicy.crd.plural,
      components: {
        Page: () => <ImagePoliciesPage extension={this} />,
      },
    },
    {
      id: ImageRepository.crd.plural,
      components: {
        Page: () => <ImageRepositoriesPage extension={this} />,
      },
    },
    {
      id: ImageUpdateAutomation.crd.plural,
      components: {
        Page: () => <ImageUpdateAutomationsPage extension={this} />,
      },
    },
    {
      id: Kustomization.crd.plural,
      components: {
        Page: () => <KustomizationsPage extension={this} />,
      },
    },
    {
      id: OCIRepository.crd.plural,
      components: {
        Page: () => <OCIRepositoriesPage extension={this} />,
      },
    },
    {
      id: Provider.crd.plural,
      components: {
        Page: () => <ProvidersPage extension={this} />,
      },
    },
    {
      id: Receiver.crd.plural,
      components: {
        Page: () => <ReceiversPage extension={this} />,
      },
    },
  ];

  clusterPageMenus = [
    {
      id: "fluxcd",
      title: "FluxCD",
      target: { pageId: "dashboard" },
      components: {
        Icon: FluxCDIcon,
      },
    },
    {
      id: "dashboard",
      parentId: "fluxcd",
      target: { pageId: "dashboard" },
      title: "Overview",
      components: {},
    },
    {
      id: "kustomize",
      parentId: "fluxcd",
      target: { pageId: Kustomization.crd.plural },
      title: "Kustomize",
      components: {},
    },
    {
      id: Kustomization.crd.plural,
      parentId: "kustomize",
      target: { pageId: Kustomization.crd.plural },
      title: Kustomization.crd.title,
      components: {},
    },
    {
      id: "helm",
      parentId: "fluxcd",
      target: { pageId: HelmRelease.crd.plural },
      title: "Helm",
      components: {},
    },
    {
      id: HelmRelease.crd.plural,
      parentId: "helm",
      target: { pageId: HelmRelease.crd.plural },
      title: HelmRelease.crd.title,
      components: {},
    },
    {
      id: "source",
      parentId: "fluxcd",
      target: { pageId: GitRepository.crd.plural },
      title: "Source",
      components: {},
    },
    {
      id: GitRepository.crd.plural,
      parentId: "source",
      target: { pageId: GitRepository.crd.plural },
      title: GitRepository.crd.title,
      components: {},
    },
    {
      id: HelmRepository.crd.plural,
      parentId: "source",
      target: { pageId: HelmRepository.crd.plural },
      title: HelmRepository.crd.title,
      components: {},
    },
    {
      id: HelmChart.crd.plural,
      parentId: "source",
      target: { pageId: HelmChart.crd.plural },
      title: HelmChart.crd.title,
      components: {},
    },
    {
      id: Bucket.crd.plural,
      parentId: "source",
      target: { pageId: Bucket.crd.plural },
      title: Bucket.crd.title,
      components: {},
    },
    {
      id: OCIRepository.crd.plural,
      parentId: "source",
      target: { pageId: OCIRepository.crd.plural },
      title: OCIRepository.crd.title,
      components: {},
    },
    {
      id: "image",
      parentId: "fluxcd",
      target: { pageId: ImageRepository.crd.plural },
      title: "Image",
      components: {},
    },
    {
      id: ImageRepository.crd.plural,
      parentId: "image",
      target: { pageId: ImageRepository.crd.plural },
      title: ImageRepository.crd.title,
      components: {},
    },
    {
      id: ImagePolicy.crd.plural,
      parentId: "image",
      target: { pageId: ImagePolicy.crd.plural },
      title: ImagePolicy.crd.title,
      components: {},
    },
    {
      id: ImageUpdateAutomation.crd.plural,
      parentId: "image",
      target: { pageId: ImageUpdateAutomation.crd.plural },
      title: ImageUpdateAutomation.crd.title,
      components: {},
    },
    {
      id: "notification",
      parentId: "fluxcd",
      target: { pageId: Alert.crd.plural },
      title: "Notification",
      components: {},
    },
    {
      id: Alert.crd.plural,
      parentId: "notification",
      target: { pageId: Alert.crd.plural },
      title: Alert.crd.title,
      components: {},
    },
    {
      id: Provider.crd.plural,
      parentId: "notification",
      target: { pageId: Provider.crd.plural },
      title: Provider.crd.title,
      components: {},
    },
    {
      id: Receiver.crd.plural,
      parentId: "notification",
      target: { pageId: Receiver.crd.plural },
      title: Receiver.crd.title,
      components: {},
    },
  ];

  kubeObjectDetailItems = [
    {
      kind: Alert.kind,
      apiVersions: Alert.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Alert>) => <AlertDetails {...props} />,
      },
    },
    {
      kind: Bucket.kind,
      apiVersions: Bucket.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Bucket>) => <BucketDetails {...props} />,
      },
    },
    {
      kind: GitRepository.kind,
      apiVersions: GitRepository.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<GitRepository>) => (
          <GitRepositoryDetails {...props} />
        ),
      },
    },
    {
      kind: HelmChart.kind,
      apiVersions: HelmChart.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmChart>) => <HelmChartDetails {...props} />,
      },
    },
    {
      kind: HelmRelease.kind,
      apiVersions: HelmRelease.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmRelease>) => <HelmReleaseDetails {...props} />,
      },
    },
    {
      kind: HelmRepository.kind,
      apiVersions: HelmRepository.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmRepository>) => (
          <HelmRepositoryDetails {...props} />
        ),
      },
    },
    {
      kind: ImagePolicy.kind,
      apiVersions: ImagePolicy.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImagePolicy>) => <ImagePolicyDetails {...props} />,
      },
    },
    {
      kind: ImageRepository.kind,
      apiVersions: ImageRepository.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImageRepository>) => (
          <ImageRepositoryDetails {...props} />
        ),
      },
    },
    {
      kind: ImageUpdateAutomation.kind,
      apiVersions: ImageUpdateAutomation.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImageUpdateAutomation>) => (
          <ImageUpdateAutomationDetails {...props} />
        ),
      },
    },
    {
      kind: Kustomization.kind,
      apiVersions: Kustomization.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Kustomization>) => (
          <KustomizationDetails {...props} />
        ),
      },
    },
    {
      kind: OCIRepository.kind,
      apiVersions: OCIRepository.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<OCIRepository>) => (
          <OCIRepositoryDetails {...props} />
        ),
      },
    },
    {
      kind: Provider.kind,
      apiVersions: Provider.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Provider>) => <ProviderDetails {...props} />,
      },
    },
    {
      kind: Receiver.kind,
      apiVersions: Receiver.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Receiver>) => <ReceiverDetails {...props} />,
      },
    },
  ];

  kubeObjectMenuItems = [
    {
      kind: Alert.kind,
      apiVersions: Alert.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Alert} />
        ),
      },
    },
    {
      kind: Alert.kind,
      apiVersions: Alert.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={Alert} />
        ),
      },
    },
    {
      kind: Bucket.kind,
      apiVersions: Bucket.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Bucket} />
        ),
      },
    },
    {
      kind: Bucket.kind,
      apiVersions: Bucket.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={Bucket} />
        ),
      },
    },
    {
      kind: GitRepository.kind,
      apiVersions: GitRepository.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={GitRepository} />
        ),
      },
    },
    {
      kind: GitRepository.kind,
      apiVersions: GitRepository.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={GitRepository} />
        ),
      },
    },
    {
      kind: HelmChart.kind,
      apiVersions: HelmChart.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={HelmChart} />
        ),
      },
    },
    {
      kind: HelmChart.kind,
      apiVersions: HelmChart.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={HelmChart} />
        ),
      },
    },
    {
      kind: HelmRelease.kind,
      apiVersions: HelmRelease.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={HelmRelease} />
        ),
      },
    },
    {
      kind: HelmRelease.kind,
      apiVersions: HelmRelease.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={HelmRelease} />
        ),
      },
    },
    {
      kind: HelmRepository.kind,
      apiVersions: HelmRepository.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={HelmRepository} />
        ),
      },
    },
    {
      kind: HelmRepository.kind,
      apiVersions: HelmRepository.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={HelmRepository} />
        ),
      },
    },
    {
      kind: ImagePolicy.kind,
      apiVersions: ImagePolicy.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={ImagePolicy} />
        ),
      },
    },
    {
      kind: ImageRepository.kind,
      apiVersions: ImageRepository.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={ImageRepository} />
        ),
      },
    },
    {
      kind: ImageRepository.kind,
      apiVersions: ImageRepository.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={ImageRepository} />
        ),
      },
    },
    {
      kind: ImageUpdateAutomation.kind,
      apiVersions: ImageUpdateAutomation.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={ImageUpdateAutomation} />
        ),
      },
    },
    {
      kind: ImageUpdateAutomation.kind,
      apiVersions: ImageUpdateAutomation.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={ImageUpdateAutomation} />
        ),
      },
    },
    {
      kind: Kustomization.kind,
      apiVersions: Kustomization.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Kustomization} />
        ),
      },
    },
    {
      kind: Kustomization.kind,
      apiVersions: Kustomization.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={Kustomization} />
        ),
      },
    },
    {
      kind: OCIRepository.kind,
      apiVersions: OCIRepository.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={OCIRepository} />
        ),
      },
    },
    {
      kind: OCIRepository.kind,
      apiVersions: OCIRepository.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={OCIRepository} />
        ),
      },
    },
    {
      kind: Provider.kind,
      apiVersions: Provider.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Provider} />
        ),
      },
    },
    {
      kind: Provider.kind,
      apiVersions: Provider.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={Provider} />
        ),
      },
    },
    {
      kind: Receiver.kind,
      apiVersions: Receiver.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Receiver} />
        ),
      },
    },
    {
      kind: Receiver.kind,
      apiVersions: Receiver.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={Receiver} />
        ),
      },
    },
  ];
}
