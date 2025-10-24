import { Renderer } from "@freelensapp/extensions";
import { HelmReleaseDetails as HelmReleaseDetails_v2 } from "./components/details/helm/helm-release-details_v2";
import { HelmReleaseDetails as HelmReleaseDetails_v2beta1 } from "./components/details/helm/helm-release-details_v2beta1";
import { HelmReleaseDetails as HelmReleaseDetails_v2beta2 } from "./components/details/helm/helm-release-details_v2beta2";
import { ImagePolicyDetails } from "./components/details/image/image-policy-details";
import { ImageRepositoryDetails } from "./components/details/image/image-repository-details";
import { ImageUpdateAutomationDetails } from "./components/details/image/image-update-automation-details";
import { KustomizationDetails_v1 } from "./components/details/kustomize/kustomization-details_v1";
import { KustomizationDetails_v1beta1 } from "./components/details/kustomize/kustomization-details_v1beta1";
import { KustomizationDetails_v1beta2 } from "./components/details/kustomize/kustomization-details_v1beta2";
import { AlertDetails } from "./components/details/notification/alert-details";
import { ProviderDetails } from "./components/details/notification/provider-details";
import { ReceiverDetails } from "./components/details/notification/receiver-details";
import { BucketDetails } from "./components/details/source/bucket-details";
import { GitRepositoryDetails } from "./components/details/source/git-repository-details";
import { HelmChartDetails } from "./components/details/source/helm-chart-details";
import { HelmRepositoryDetails } from "./components/details/source/helm-repository-details";
import { OCIRepositoryDetails } from "./components/details/source/oci-repository-details";
import svgIcon from "./icons/fluxcd.svg?raw";
import { HelmRelease as HelmRelease_v2 } from "./k8s/fluxcd/helm/helmrelease_v2";
import { HelmRelease as HelmRelease_v2beta1 } from "./k8s/fluxcd/helm/helmrelease_v2beta1";
import { HelmRelease as HelmRelease_v2beta2 } from "./k8s/fluxcd/helm/helmrelease_v2beta2";
import { ImagePolicy } from "./k8s/fluxcd/image/imagepolicy";
import { ImageRepository } from "./k8s/fluxcd/image/imagerepository";
import { ImageUpdateAutomation } from "./k8s/fluxcd/image/imageupdateautomation";
import { Kustomization as Kustomization_v1 } from "./k8s/fluxcd/kustomize/kustomization_v1";
import { Kustomization as Kustomization_v1beta1 } from "./k8s/fluxcd/kustomize/kustomization_v1beta1";
import { Kustomization as Kustomization_v1beta2 } from "./k8s/fluxcd/kustomize/kustomization_v1beta2";
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
import { HelmReleasesPage as HelmReleasesPage_v2 } from "./pages/helm/helmreleases_v2";
import { HelmReleasesPage as HelmReleasesPage_v2beta1 } from "./pages/helm/helmreleases_v2beta1";
import { HelmReleasesPage as HelmReleasesPage_v2beta2 } from "./pages/helm/helmreleases_v2beta2";
import { ImagePoliciesPage } from "./pages/image/imagepolicies";
import { ImageRepositoriesPage } from "./pages/image/imagerepositories";
import { ImageUpdateAutomationsPage } from "./pages/image/imageupdateautomations";
import { KustomizationsPage_v1 } from "./pages/kustomize/kustomizations_v1";
import { KustomizationsPage_v1beta1 } from "./pages/kustomize/kustomizations_v1beta1";
import { KustomizationsPage_v1beta2 } from "./pages/kustomize/kustomizations_v1beta2";
import { AlertsPage } from "./pages/notifications/alerts";
import { ProvidersPage } from "./pages/notifications/providers";
import { ReceiversPage } from "./pages/notifications/receivers";
import { FluxCDOverviewPage } from "./pages/overview";
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
        Page: () => <FluxCDOverviewPage />,
      },
    },
    {
      id: "alert",
      components: {
        Page: () => <AlertsPage extension={this} />,
      },
    },
    {
      id: "bucket",
      components: {
        Page: () => <BucketsPage extension={this} />,
      },
    },
    {
      id: "gitrepository",
      components: {
        Page: () => <GitRepositoriesPage extension={this} />,
      },
    },
    {
      id: "helmchart",
      components: {
        Page: () => <HelmChartsPage extension={this} />,
      },
    },
    {
      id: "helmrelease",
      components: {
        Page: () => <HelmReleasesPage_v2beta1 extension={this} />,
      },
    },
    {
      id: "helmrelease",
      components: {
        Page: () => <HelmReleasesPage_v2beta2 extension={this} />,
      },
    },
    {
      id: "helmrelease",
      components: {
        Page: () => <HelmReleasesPage_v2 extension={this} />,
      },
    },
    {
      id: "helmrepository",
      components: {
        Page: () => <HelmRepositoriesPage extension={this} />,
      },
    },
    {
      id: "imagepolicy",
      components: {
        Page: () => <ImagePoliciesPage extension={this} />,
      },
    },
    {
      id: "imagerepository",
      components: {
        Page: () => <ImageRepositoriesPage extension={this} />,
      },
    },
    {
      id: "imageupdateautomation",
      components: {
        Page: () => <ImageUpdateAutomationsPage extension={this} />,
      },
    },
    {
      id: "kustomization",
      components: {
        Page: () => <KustomizationsPage_v1beta1 extension={this} />,
      },
    },
    {
      id: "kustomization",
      components: {
        Page: () => <KustomizationsPage_v1beta2 extension={this} />,
      },
    },
    {
      id: "kustomization",
      components: {
        Page: () => <KustomizationsPage_v1 extension={this} />,
      },
    },
    {
      id: "ocirepository",
      components: {
        Page: () => <OCIRepositoriesPage extension={this} />,
      },
    },
    {
      id: "provider",
      components: {
        Page: () => <ProvidersPage extension={this} />,
      },
    },
    {
      id: "receiver",
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
      target: { pageId: "kustomization" },
      title: "Kustomize",
      components: {},
    },
    {
      id: "kustomization",
      parentId: "kustomize",
      target: { pageId: "kustomization" },
      title: Kustomization_v1beta1.crd.title,
      components: {},
    },
    {
      id: "kustomization",
      parentId: "kustomize",
      target: { pageId: "kustomization" },
      title: Kustomization_v1beta2.crd.title,
      components: {},
    },
    {
      id: "kustomization",
      parentId: "kustomize",
      target: { pageId: "kustomization" },
      title: Kustomization_v1.crd.title,
      components: {},
    },
    {
      id: "helm",
      parentId: "fluxcd",
      target: { pageId: "helmrelease" },
      title: "Helm",
      components: {},
    },
    {
      id: "helmrelease",
      parentId: "helm",
      target: { pageId: "helmrelease" },
      title: HelmRelease_v2beta1.crd.title,
      components: {},
    },
    {
      id: "helmrelease",
      parentId: "helm",
      target: { pageId: "helmrelease" },
      title: HelmRelease_v2beta2.crd.title,
      components: {},
    },
    {
      id: "helmrelease",
      parentId: "helm",
      target: { pageId: "helmrelease" },
      title: HelmRelease_v2.crd.title,
      components: {},
    },
    {
      id: "source",
      parentId: "fluxcd",
      target: { pageId: "gitrepository" },
      title: "Source",
      components: {},
    },
    {
      id: "gitrepository",
      parentId: "source",
      target: { pageId: "gitrepository" },
      title: GitRepository.crd.title,
      components: {},
    },
    {
      id: "helmrepository",
      parentId: "source",
      target: { pageId: "helmrepository" },
      title: HelmRepository.crd.title,
      components: {},
    },
    {
      id: "helmchart",
      parentId: "source",
      target: { pageId: "helmchart" },
      title: HelmChart.crd.title,
      components: {},
    },
    {
      id: "bucket",
      parentId: "source",
      target: { pageId: "bucket" },
      title: Bucket.crd.title,
      components: {},
    },
    {
      id: "ocirepository",
      parentId: "source",
      target: { pageId: "ocirepository" },
      title: OCIRepository.crd.title,
      components: {},
    },
    {
      id: "image",
      parentId: "fluxcd",
      target: { pageId: "imagerepository" },
      title: "Image",
      components: {},
    },
    {
      id: "imagerepository",
      parentId: "image",
      target: { pageId: "imagerepository" },
      title: ImageRepository.crd.title,
      components: {},
    },
    {
      id: "imagepolicy",
      parentId: "image",
      target: { pageId: "imagepolicy" },
      title: ImagePolicy.crd.title,
      components: {},
    },
    {
      id: "imageupdateautomation",
      parentId: "image",
      target: { pageId: "imageupdateautomation" },
      title: ImageUpdateAutomation.crd.title,
      components: {},
    },
    {
      id: "notification",
      parentId: "fluxcd",
      target: { pageId: "alert" },
      title: "Notification",
      components: {},
    },
    {
      id: "alert",
      parentId: "notification",
      target: { pageId: "alert" },
      title: Alert.crd.title,
      components: {},
    },
    {
      id: "provider",
      parentId: "notification",
      target: { pageId: "provider" },
      title: Provider.crd.title,
      components: {},
    },
    {
      id: "receiver",
      parentId: "notification",
      target: { pageId: "receiver" },
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
      kind: HelmRelease_v2beta1.kind,
      apiVersions: HelmRelease_v2beta1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmRelease_v2beta1>) => (
          <HelmReleaseDetails_v2beta1 {...props} />
        ),
      },
    },
    {
      kind: HelmRelease_v2beta2.kind,
      apiVersions: HelmRelease_v2beta2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmRelease_v2beta2>) => (
          <HelmReleaseDetails_v2beta2 {...props} />
        ),
      },
    },
    {
      kind: HelmRelease_v2.kind,
      apiVersions: HelmRelease_v2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmRelease_v2>) => (
          <HelmReleaseDetails_v2 {...props} />
        ),
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
      kind: Kustomization_v1beta1.kind,
      apiVersions: Kustomization_v1beta1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Kustomization_v1beta1>) => (
          <KustomizationDetails_v1beta1 {...props} />
        ),
      },
    },
    {
      kind: Kustomization_v1beta2.kind,
      apiVersions: Kustomization_v1beta2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Kustomization_v1beta2>) => (
          <KustomizationDetails_v1beta2 {...props} />
        ),
      },
    },
    {
      kind: Kustomization_v1.kind,
      apiVersions: Kustomization_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Kustomization_v1>) => (
          <KustomizationDetails_v1 {...props} />
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
      kind: HelmRelease_v2beta1.kind,
      apiVersions: HelmRelease_v2beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={HelmRelease_v2beta1} />
        ),
      },
    },
    {
      kind: HelmRelease_v2beta1.kind,
      apiVersions: HelmRelease_v2beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={HelmRelease_v2beta1} />
        ),
      },
    },
    {
      kind: HelmRelease_v2beta2.kind,
      apiVersions: HelmRelease_v2beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={HelmRelease_v2beta2} />
        ),
      },
    },
    {
      kind: HelmRelease_v2beta2.kind,
      apiVersions: HelmRelease_v2beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={HelmRelease_v2beta2} />
        ),
      },
    },
    {
      kind: HelmRelease_v2.kind,
      apiVersions: HelmRelease_v2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={HelmRelease_v2} />
        ),
      },
    },
    {
      kind: HelmRelease_v2.kind,
      apiVersions: HelmRelease_v2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={HelmRelease_v2} />
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
      kind: Kustomization_v1beta1.kind,
      apiVersions: Kustomization_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Kustomization_v1beta1} />
        ),
      },
    },
    {
      kind: Kustomization_v1beta1.kind,
      apiVersions: Kustomization_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={Kustomization_v1beta1} />
        ),
      },
    },
    {
      kind: Kustomization_v1beta2.kind,
      apiVersions: Kustomization_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Kustomization_v1beta2} />
        ),
      },
    },
    {
      kind: Kustomization_v1beta2.kind,
      apiVersions: Kustomization_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={Kustomization_v1beta2} />
        ),
      },
    },
    {
      kind: Kustomization_v1.kind,
      apiVersions: Kustomization_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Kustomization_v1} />
        ),
      },
    },
    {
      kind: Kustomization_v1.kind,
      apiVersions: Kustomization_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSuspendResumeMenuItemProps) => (
          <FluxCDObjectSuspendResumeMenuItem {...props} resource={Kustomization_v1} />
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
