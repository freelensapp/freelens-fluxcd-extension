import { Renderer } from "@freelensapp/extensions";
import { FluxInstanceDetails as FluxInstanceDetails_v1 } from "./components/details/controlplane/flux-instance-details-v1";
import { FluxReportDetails as FluxReportDetails_v1 } from "./components/details/controlplane/flux-report-details-v1";
import { ResourceSetDetails as ResourceSetDetails_v1 } from "./components/details/controlplane/resource-set-details";
import { ResourceSetInputProviderDetails as ResourceSetInputProviderDetails_v1 } from "./components/details/controlplane/resource-set-input-provider-details-v1";
import { HelmReleaseDetails as HelmReleaseDetails_v2 } from "./components/details/helm/helm-release-details-v2";
import { HelmReleaseDetails as HelmReleaseDetails_v2beta1 } from "./components/details/helm/helm-release-details-v2beta1";
import { HelmReleaseDetails as HelmReleaseDetails_v2beta2 } from "./components/details/helm/helm-release-details-v2beta2";
import { ImagePolicyDetails as ImagePolicyDetails_v1 } from "./components/details/image/image-policy-details-v1";
import { ImagePolicyDetails as ImagePolicyDetails_v1beta1 } from "./components/details/image/image-policy-details-v1beta1";
import { ImagePolicyDetails as ImagePolicyDetails_v1beta2 } from "./components/details/image/image-policy-details-v1beta2";
import { ImageRepositoryDetails as ImageRepositoryDetails_v1 } from "./components/details/image/image-repository-details-v1";
import { ImageRepositoryDetails as ImageRepositoryDetails_v1beta1 } from "./components/details/image/image-repository-details-v1beta1";
import { ImageRepositoryDetails as ImageRepositoryDetails_v1beta2 } from "./components/details/image/image-repository-details-v1beta2";
import { ImageUpdateAutomationDetails as ImageUpdateAutomationDetails_v1 } from "./components/details/image/image-update-automation-details-v1";
import { ImageUpdateAutomationDetails as ImageUpdateAutomationDetails_v1beta1 } from "./components/details/image/image-update-automation-details-v1beta1";
import { ImageUpdateAutomationDetails as ImageUpdateAutomationDetails_v1beta2 } from "./components/details/image/image-update-automation-details-v1beta2";
import { KustomizationDetails as KustomizationDetails_v1 } from "./components/details/kustomize/kustomization-details-v1";
import { KustomizationDetails as KustomizationDetails_v1beta1 } from "./components/details/kustomize/kustomization-details-v1beta1";
import { KustomizationDetails as KustomizationDetails_v1beta2 } from "./components/details/kustomize/kustomization-details-v1beta2";
import { AlertDetails as AlertDetails_v1beta1 } from "./components/details/notification/alert-details-v1beta1";
import { AlertDetails as AlertDetails_v1beta2 } from "./components/details/notification/alert-details-v1beta2";
import { AlertDetails as AlertDetails_v1beta3 } from "./components/details/notification/alert-details-v1beta3";
import { ProviderDetails as ProviderDetails_v1beta1 } from "./components/details/notification/provider-details-v1beta1";
import { ProviderDetails as ProviderDetails_v1beta2 } from "./components/details/notification/provider-details-v1beta2";
import { ProviderDetails as ProviderDetails_v1beta3 } from "./components/details/notification/provider-details-v1beta3";
import { ReceiverDetails as ReceiverDetails_v1 } from "./components/details/notification/receiver-details-v1";
import { ReceiverDetails as ReceiverDetails_v1beta1 } from "./components/details/notification/receiver-details-v1beta1";
import { ReceiverDetails as ReceiverDetails_v1beta2 } from "./components/details/notification/receiver-details-v1beta2";
import { ReceiverDetails as ReceiverDetails_v1beta3 } from "./components/details/notification/receiver-details-v1beta3";
import { BucketDetails as BucketDetails_v1 } from "./components/details/source/bucket-details-v1";
import { BucketDetails as BucketDetails_v1beta1 } from "./components/details/source/bucket-details-v1beta1";
import { BucketDetails as BucketDetails_v1beta2 } from "./components/details/source/bucket-details-v1beta2";
import { GitRepositoryDetails as GitRepositoryDetails_v1 } from "./components/details/source/git-repository-details-v1";
import { GitRepositoryDetails as GitRepositoryDetails_v1beta1 } from "./components/details/source/git-repository-details-v1beta1";
import { GitRepositoryDetails as GitRepositoryDetails_v1beta2 } from "./components/details/source/git-repository-details-v1beta2";
import { HelmChartDetails as HelmChartDetails_v1 } from "./components/details/source/helm-chart-details-v1";
import { HelmChartDetails as HelmChartDetails_v1beta1 } from "./components/details/source/helm-chart-details-v1beta1";
import { HelmChartDetails as HelmChartDetails_v1beta2 } from "./components/details/source/helm-chart-details-v1beta2";
import { HelmRepositoryDetails as HelmRepositoryDetails_v1 } from "./components/details/source/helm-repository-details-v1";
import { HelmRepositoryDetails as HelmRepositoryDetails_v1beta1 } from "./components/details/source/helm-repository-details-v1beta1";
import { HelmRepositoryDetails as HelmRepositoryDetails_v1beta2 } from "./components/details/source/helm-repository-details-v1beta2";
import { OCIRepositoryDetails as OCIRepositoryDetails_v1 } from "./components/details/source/oci-repository-details-v1";
import { OCIRepositoryDetails as OCIRepositoryDetails_v1beta2 } from "./components/details/source/oci-repository-details-v1beta2";
import svgIcon from "./icons/fluxcd.svg?raw";
import { FluxInstance as FluxInstance_v1 } from "./k8s/fluxcd/controlplane/fluxinstance-v1";
import { FluxReport as FluxReport_v1 } from "./k8s/fluxcd/controlplane/fluxreport-v1";
import { ResourceSet as ResourceSet_v1 } from "./k8s/fluxcd/controlplane/resourceset-v1";
import { ResourceSetInputProvider as ResourceSetInputProvider_v1 } from "./k8s/fluxcd/controlplane/resourcesetinputprovider-v1";
import { HelmRelease as HelmRelease_v2 } from "./k8s/fluxcd/helm/helmrelease-v2";
import { HelmRelease as HelmRelease_v2beta1 } from "./k8s/fluxcd/helm/helmrelease-v2beta1";
import { HelmRelease as HelmRelease_v2beta2 } from "./k8s/fluxcd/helm/helmrelease-v2beta2";
import { ImagePolicy as ImagePolicy_v1 } from "./k8s/fluxcd/image/imagepolicy-v1";
import { ImagePolicy as ImagePolicy_v1beta1 } from "./k8s/fluxcd/image/imagepolicy-v1beta1";
import { ImagePolicy as ImagePolicy_v1beta2 } from "./k8s/fluxcd/image/imagepolicy-v1beta2";
import { ImageRepository as ImageRepository_v1 } from "./k8s/fluxcd/image/imagerepository-v1";
import { ImageRepository as ImageRepository_v1beta1 } from "./k8s/fluxcd/image/imagerepository-v1beta1";
import { ImageRepository as ImageRepository_v1beta2 } from "./k8s/fluxcd/image/imagerepository-v1beta2";
import { ImageUpdateAutomation as ImageUpdateAutomation_v1 } from "./k8s/fluxcd/image/imageupdateautomation-v1";
import { ImageUpdateAutomation as ImageUpdateAutomation_v1beta1 } from "./k8s/fluxcd/image/imageupdateautomation-v1beta1";
import { ImageUpdateAutomation as ImageUpdateAutomation_v1beta2 } from "./k8s/fluxcd/image/imageupdateautomation-v1beta2";
import { Kustomization as Kustomization_v1 } from "./k8s/fluxcd/kustomize/kustomization-v1";
import { Kustomization as Kustomization_v1beta1 } from "./k8s/fluxcd/kustomize/kustomization-v1beta1";
import { Kustomization as Kustomization_v1beta2 } from "./k8s/fluxcd/kustomize/kustomization-v1beta2";
import { Alert as Alert_v1beta1 } from "./k8s/fluxcd/notification/alert-v1beta1";
import { Alert as Alert_v1beta2 } from "./k8s/fluxcd/notification/alert-v1beta2";
import { Alert as Alert_v1beta3 } from "./k8s/fluxcd/notification/alert-v1beta3";
import { Provider as Provider_v1beta1 } from "./k8s/fluxcd/notification/provider-v1beta1";
import { Provider as Provider_v1beta2 } from "./k8s/fluxcd/notification/provider-v1beta2";
import { Provider as Provider_v1beta3 } from "./k8s/fluxcd/notification/provider-v1beta3";
import { Receiver as Receiver_v1 } from "./k8s/fluxcd/notification/receiver-v1";
import { Receiver as Receiver_v1beta1 } from "./k8s/fluxcd/notification/receiver-v1beta1";
import { Receiver as Receiver_v1beta2 } from "./k8s/fluxcd/notification/receiver-v1beta2";
import { Receiver as Receiver_v1beta3 } from "./k8s/fluxcd/notification/receiver-v1beta3";
import { Bucket as Bucket_v1 } from "./k8s/fluxcd/source/bucket-v1";
import { Bucket as Bucket_v1beta1 } from "./k8s/fluxcd/source/bucket-v1beta1";
import { Bucket as Bucket_v1beta2 } from "./k8s/fluxcd/source/bucket-v1beta2";
import { GitRepository as GitRepository_v1 } from "./k8s/fluxcd/source/gitrepository-v1";
import { GitRepository as GitRepository_v1beta1 } from "./k8s/fluxcd/source/gitrepository-v1beta1";
import { GitRepository as GitRepository_v1beta2 } from "./k8s/fluxcd/source/gitrepository-v1beta2";
import { HelmChart as HelmChart_v1 } from "./k8s/fluxcd/source/helmchart-v1";
import { HelmChart as HelmChart_v1beta1 } from "./k8s/fluxcd/source/helmchart-v1beta1";
import { HelmChart as HelmChart_v1beta2 } from "./k8s/fluxcd/source/helmchart-v1beta2";
import { HelmRepository as HelmRepository_v1 } from "./k8s/fluxcd/source/helmrepository-v1";
import { HelmRepository as HelmRepository_v1beta1 } from "./k8s/fluxcd/source/helmrepository-v1beta1";
import { HelmRepository as HelmRepository_v1beta2 } from "./k8s/fluxcd/source/helmrepository-v1beta2";
import { OCIRepository as OCIRepository_v1 } from "./k8s/fluxcd/source/ocirepository-v1";
import { OCIRepository as OCIRepository_v1beta2 } from "./k8s/fluxcd/source/ocirepository-v1beta2";
import { FluxCDObjectAnnotationSuspendResumeMenuItem } from "./menus/fluxcd-object-annotation-suspend-resume-menu-item";
import {
  FluxCDObjectReconcileMenuItem,
  type FluxCDObjectReconcileMenuItemProps,
} from "./menus/fluxcd-object-reconcile-menu-item";
import {
  FluxCDObjectSpecSuspendResumeMenuItem,
  type FluxCDObjectSpecSuspendResumeMenuItemProps,
} from "./menus/fluxcd-object-spec-suspend-resume-menu-item";
import { FluxInstancesPage as FluxInstancesPage_v1 } from "./pages/controlplane/fluxinstances-v1";
import { FluxReportsPage as FluxReportsPage_v1 } from "./pages/controlplane/fluxreports-v1";
import { ResourceSetInputProvidersPage as ResourceSetInputProvidersPage_v1 } from "./pages/controlplane/resourcesetinputproviders-v1";
import { ResourceSetsPage as ResourceSetsPage_v1 } from "./pages/controlplane/resourcesets-v1";
import { HelmReleasesPage as HelmReleasesPage_v2 } from "./pages/helm/helmreleases-v2";
import { HelmReleasesPage as HelmReleasesPage_v2beta1 } from "./pages/helm/helmreleases-v2beta1";
import { HelmReleasesPage as HelmReleasesPage_v2beta2 } from "./pages/helm/helmreleases-v2beta2";
import { ImagePoliciesPage as ImagePoliciesPage_v1 } from "./pages/image/imagepolicies-v1";
import { ImagePoliciesPage as ImagePoliciesPage_v1beta1 } from "./pages/image/imagepolicies-v1beta1";
import { ImagePoliciesPage as ImagePoliciesPage_v1beta2 } from "./pages/image/imagepolicies-v1beta2";
import { ImageRepositoriesPage as ImageRepositoriesPage_v1 } from "./pages/image/imagerepositories-v1";
import { ImageRepositoriesPage as ImageRepositoriesPage_v1beta1 } from "./pages/image/imagerepositories-v1beta1";
import { ImageRepositoriesPage as ImageRepositoriesPage_v1beta2 } from "./pages/image/imagerepositories-v1beta2";
import { ImageUpdateAutomationsPage as ImageUpdateAutomationsPage_v1 } from "./pages/image/imageupdateautomations-v1";
import { ImageUpdateAutomationsPage as ImageUpdateAutomationsPage_v1beta1 } from "./pages/image/imageupdateautomations-v1beta1";
import { ImageUpdateAutomationsPage as ImageUpdateAutomationsPage_v1beta2 } from "./pages/image/imageupdateautomations-v1beta2";
import { KustomizationsPage_v1 } from "./pages/kustomize/kustomizations-v1";
import { KustomizationsPage_v1beta1 } from "./pages/kustomize/kustomizations-v1beta1";
import { KustomizationsPage_v1beta2 } from "./pages/kustomize/kustomizations-v1beta2";
import { AlertsPage as AlertsPage_v1beta1 } from "./pages/notifications/alerts-v1beta1";
import { AlertsPage as AlertsPage_v1beta2 } from "./pages/notifications/alerts-v1beta2";
import { AlertsPage as AlertsPage_v1beta3 } from "./pages/notifications/alerts-v1beta3";
import { ProvidersPage as ProvidersPage_v1beta1 } from "./pages/notifications/providers-v1beta1";
import { ProvidersPage as ProvidersPage_v1beta2 } from "./pages/notifications/providers-v1beta2";
import { ProvidersPage as ProvidersPage_v1beta3 } from "./pages/notifications/providers-v1beta3";
import { ReceiversPage as ReceiversPage_v1 } from "./pages/notifications/receivers-v1";
import { ReceiversPage as ReceiversPage_v1beta1 } from "./pages/notifications/receivers-v1beta1";
import { ReceiversPage as ReceiversPage_v1beta2 } from "./pages/notifications/receivers-v1beta2";
import { ReceiversPage as ReceiversPage_v1beta3 } from "./pages/notifications/receivers-v1beta3";
import { FluxCDOverviewPage } from "./pages/overview";
import { BucketsPage as BucketsPage_v1 } from "./pages/source/buckets-v1";
import { BucketsPage as BucketsPage_v1beta1 } from "./pages/source/buckets-v1beta1";
import { BucketsPage as BucketsPage_v1beta2 } from "./pages/source/buckets-v1beta2";
import { GitRepositoriesPage as GitRepositoriesPage_v1 } from "./pages/source/gitrepositories-v1";
import { GitRepositoriesPage as GitRepositoriesPage_v1beta1 } from "./pages/source/gitrepositories-v1beta1";
import { GitRepositoriesPage as GitRepositoriesPage_v1beta2 } from "./pages/source/gitrepositories-v1beta2";
import { HelmChartsPage as HelmChartsPage_v1 } from "./pages/source/helmcharts-v1";
import { HelmChartsPage as HelmChartsPage_v1beta1 } from "./pages/source/helmcharts-v1beta1";
import { HelmChartsPage as HelmChartsPage_v1beta2 } from "./pages/source/helmcharts-v1beta2";
import { HelmRepositoriesPage as HelmRepositoriesPage_v1 } from "./pages/source/helmrepositories-v1";
import { HelmRepositoriesPage as HelmRepositoriesPage_v1beta1 } from "./pages/source/helmrepositories-v1beta1";
import { HelmRepositoriesPage as HelmRepositoriesPage_v1beta2 } from "./pages/source/helmrepositories-v1beta2";
import { OCIRepositoriesPage as OCIRepositoriesPage_v1 } from "./pages/source/ocirepositories-v1";
import { OCIRepositoriesPage as OCIRepositoriesPage_v1beta2 } from "./pages/source/ocirepositories-v1beta2";

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
        Page: () => <AlertsPage_v1beta1 extension={this} />,
      },
    },
    {
      id: "alert",
      components: {
        Page: () => <AlertsPage_v1beta2 extension={this} />,
      },
    },
    {
      id: "alert",
      components: {
        Page: () => <AlertsPage_v1beta3 extension={this} />,
      },
    },
    {
      id: "bucket",
      components: {
        Page: () => <BucketsPage_v1beta1 extension={this} />,
      },
    },
    {
      id: "bucket",
      components: {
        Page: () => <BucketsPage_v1beta2 extension={this} />,
      },
    },
    {
      id: "bucket",
      components: {
        Page: () => <BucketsPage_v1 extension={this} />,
      },
    },
    {
      id: "fluxinstance",
      components: {
        Page: () => <FluxInstancesPage_v1 extension={this} />,
      },
    },
    {
      id: "fluxreport",
      components: {
        Page: () => <FluxReportsPage_v1 extension={this} />,
      },
    },
    {
      id: "gitrepository",
      components: {
        Page: () => <GitRepositoriesPage_v1beta1 extension={this} />,
      },
    },
    {
      id: "gitrepository",
      components: {
        Page: () => <GitRepositoriesPage_v1beta2 extension={this} />,
      },
    },
    {
      id: "gitrepository",
      components: {
        Page: () => <GitRepositoriesPage_v1 extension={this} />,
      },
    },
    {
      id: "helmchart",
      components: {
        Page: () => <HelmChartsPage_v1beta1 extension={this} />,
      },
    },
    {
      id: "helmchart",
      components: {
        Page: () => <HelmChartsPage_v1beta2 extension={this} />,
      },
    },
    {
      id: "helmchart",
      components: {
        Page: () => <HelmChartsPage_v1 extension={this} />,
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
        Page: () => <HelmRepositoriesPage_v1beta1 extension={this} />,
      },
    },
    {
      id: "helmrepository",
      components: {
        Page: () => <HelmRepositoriesPage_v1beta2 extension={this} />,
      },
    },
    {
      id: "helmrepository",
      components: {
        Page: () => <HelmRepositoriesPage_v1 extension={this} />,
      },
    },
    {
      id: "imagepolicy",
      components: {
        Page: () => <ImagePoliciesPage_v1beta1 extension={this} />,
      },
    },
    {
      id: "imagepolicy",
      components: {
        Page: () => <ImagePoliciesPage_v1beta2 extension={this} />,
      },
    },
    {
      id: "imagepolicy",
      components: {
        Page: () => <ImagePoliciesPage_v1 extension={this} />,
      },
    },
    {
      id: "imagerepository",
      components: {
        Page: () => <ImageRepositoriesPage_v1beta1 extension={this} />,
      },
    },
    {
      id: "imagerepository",
      components: {
        Page: () => <ImageRepositoriesPage_v1beta2 extension={this} />,
      },
    },
    {
      id: "imagerepository",
      components: {
        Page: () => <ImageRepositoriesPage_v1 extension={this} />,
      },
    },
    {
      id: "imageupdateautomation",
      components: {
        Page: () => <ImageUpdateAutomationsPage_v1beta1 extension={this} />,
      },
    },
    {
      id: "imageupdateautomation",
      components: {
        Page: () => <ImageUpdateAutomationsPage_v1beta2 extension={this} />,
      },
    },
    {
      id: "imageupdateautomation",
      components: {
        Page: () => <ImageUpdateAutomationsPage_v1 extension={this} />,
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
        Page: () => <OCIRepositoriesPage_v1beta2 extension={this} />,
      },
    },
    {
      id: "ocirepository",
      components: {
        Page: () => <OCIRepositoriesPage_v1 extension={this} />,
      },
    },
    {
      id: "provider",
      components: {
        Page: () => <ProvidersPage_v1beta1 extension={this} />,
      },
    },
    {
      id: "provider",
      components: {
        Page: () => <ProvidersPage_v1beta2 extension={this} />,
      },
    },
    {
      id: "provider",
      components: {
        Page: () => <ProvidersPage_v1beta3 extension={this} />,
      },
    },
    {
      id: "receiver",
      components: {
        Page: () => <ReceiversPage_v1beta1 extension={this} />,
      },
    },
    {
      id: "receiver",
      components: {
        Page: () => <ReceiversPage_v1beta2 extension={this} />,
      },
    },
    {
      id: "receiver",
      components: {
        Page: () => <ReceiversPage_v1beta3 extension={this} />,
      },
    },
    {
      id: "receiver",
      components: {
        Page: () => <ReceiversPage_v1 extension={this} />,
      },
    },
    {
      id: "resourceset",
      components: {
        Page: () => <ResourceSetsPage_v1 extension={this} />,
      },
    },
    {
      id: "resourcesetinputprovider",
      components: {
        Page: () => <ResourceSetInputProvidersPage_v1 extension={this} />,
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
      id: "controlplane",
      parentId: "fluxcd",
      target: { pageId: "fluxinstance" },
      title: "Operator",
      components: {},
    },
    {
      id: "fluxinstance",
      parentId: "controlplane",
      target: { pageId: "fluxinstance" },
      title: FluxInstance_v1.crd.title,
      components: {},
    },
    {
      id: "fluxreport",
      parentId: "controlplane",
      target: { pageId: "fluxreport" },
      title: FluxReport_v1.crd.title,
      components: {},
    },
    {
      id: "resourceset",
      parentId: "controlplane",
      target: { pageId: "resourceset" },
      title: ResourceSet_v1.crd.title,
      components: {},
    },
    {
      id: "resourcesetinputprovider",
      parentId: "controlplane",
      target: { pageId: "resourcesetinputprovider" },
      title: ResourceSetInputProvider_v1.crd.title,
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
      title: GitRepository_v1beta1.crd.title,
      components: {},
    },
    {
      id: "gitrepository",
      parentId: "source",
      target: { pageId: "gitrepository" },
      title: GitRepository_v1beta2.crd.title,
      components: {},
    },
    {
      id: "gitrepository",
      parentId: "source",
      target: { pageId: "gitrepository" },
      title: GitRepository_v1.crd.title,
      components: {},
    },
    {
      id: "helmrepository",
      parentId: "source",
      target: { pageId: "helmrepository" },
      title: HelmRepository_v1.crd.title,
      components: {},
    },
    {
      id: "helmchart",
      parentId: "source",
      target: { pageId: "helmchart" },
      title: HelmChart_v1.crd.title,
      components: {},
    },
    {
      id: "bucket",
      parentId: "source",
      target: { pageId: "bucket" },
      title: Bucket_v1.crd.title,
      components: {},
    },
    {
      id: "ocirepository",
      parentId: "source",
      target: { pageId: "ocirepository" },
      title: OCIRepository_v1.crd.title,
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
      title: ImageRepository_v1beta1.crd.title,
      components: {},
    },
    {
      id: "imagerepository",
      parentId: "image",
      target: { pageId: "imagerepository" },
      title: ImageRepository_v1beta2.crd.title,
      components: {},
    },
    {
      id: "imagerepository",
      parentId: "image",
      target: { pageId: "imagerepository" },
      title: ImageRepository_v1beta2.crd.title,
      components: {},
    },
    {
      id: "imagepolicy",
      parentId: "image",
      target: { pageId: "imagepolicy" },
      title: ImagePolicy_v1beta1.crd.title,
      components: {},
    },
    {
      id: "imagepolicy",
      parentId: "image",
      target: { pageId: "imagepolicy" },
      title: ImagePolicy_v1beta2.crd.title,
      components: {},
    },
    {
      id: "imagepolicy",
      parentId: "image",
      target: { pageId: "imagepolicy" },
      title: ImagePolicy_v1.crd.title,
      components: {},
    },
    {
      id: "imageupdateautomation",
      parentId: "image",
      target: { pageId: "imageupdateautomation" },
      title: ImageUpdateAutomation_v1beta1.crd.title,
      components: {},
    },
    {
      id: "imageupdateautomation",
      parentId: "image",
      target: { pageId: "imageupdateautomation" },
      title: ImageUpdateAutomation_v1beta2.crd.title,
      components: {},
    },
    {
      id: "imageupdateautomation",
      parentId: "image",
      target: { pageId: "imageupdateautomation" },
      title: ImageUpdateAutomation_v1.crd.title,
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
      title: Alert_v1beta1.crd.title,
      components: {},
    },
    {
      id: "alert",
      parentId: "notification",
      target: { pageId: "alert" },
      title: Alert_v1beta2.crd.title,
      components: {},
    },
    {
      id: "alert",
      parentId: "notification",
      target: { pageId: "alert" },
      title: Alert_v1beta3.crd.title,
      components: {},
    },
    {
      id: "provider",
      parentId: "notification",
      target: { pageId: "provider" },
      title: Provider_v1beta1.crd.title,
      components: {},
    },
    {
      id: "provider",
      parentId: "notification",
      target: { pageId: "provider" },
      title: Provider_v1beta2.crd.title,
      components: {},
    },
    {
      id: "provider",
      parentId: "notification",
      target: { pageId: "provider" },
      title: Provider_v1beta3.crd.title,
      components: {},
    },
    {
      id: "receiver",
      parentId: "notification",
      target: { pageId: "receiver" },
      title: Receiver_v1beta1.crd.title,
      components: {},
    },
    {
      id: "receiver",
      parentId: "notification",
      target: { pageId: "receiver" },
      title: Receiver_v1beta2.crd.title,
      components: {},
    },
    {
      id: "receiver",
      parentId: "notification",
      target: { pageId: "receiver" },
      title: Receiver_v1beta3.crd.title,
      components: {},
    },
    {
      id: "receiver",
      parentId: "notification",
      target: { pageId: "receiver" },
      title: Receiver_v1.crd.title,
      components: {},
    },
  ];

  kubeObjectDetailItems = [
    {
      kind: Alert_v1beta1.kind,
      apiVersions: Alert_v1beta1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Alert_v1beta1>) => (
          <AlertDetails_v1beta1 {...props} />
        ),
      },
    },
    {
      kind: Alert_v1beta2.kind,
      apiVersions: Alert_v1beta2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Alert_v1beta2>) => (
          <AlertDetails_v1beta2 {...props} />
        ),
      },
    },
    {
      kind: Alert_v1beta3.kind,
      apiVersions: Alert_v1beta3.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Alert_v1beta3>) => (
          <AlertDetails_v1beta3 {...props} />
        ),
      },
    },
    {
      kind: Bucket_v1beta1.kind,
      apiVersions: Bucket_v1beta1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Bucket_v1beta1>) => (
          <BucketDetails_v1beta1 {...props} />
        ),
      },
    },
    {
      kind: Bucket_v1beta2.kind,
      apiVersions: Bucket_v1beta2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Bucket_v1beta2>) => (
          <BucketDetails_v1beta2 {...props} />
        ),
      },
    },
    {
      kind: Bucket_v1.kind,
      apiVersions: Bucket_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Bucket_v1>) => <BucketDetails_v1 {...props} />,
      },
    },
    {
      kind: FluxInstance_v1.kind,
      apiVersions: FluxInstance_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<FluxInstance_v1>) => (
          <FluxInstanceDetails_v1 {...props} />
        ),
      },
    },
    {
      kind: FluxReport_v1.kind,
      apiVersions: FluxReport_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<FluxReport_v1>) => (
          <FluxReportDetails_v1 {...props} />
        ),
      },
    },
    {
      kind: GitRepository_v1beta1.kind,
      apiVersions: GitRepository_v1beta1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<GitRepository_v1beta1>) => (
          <GitRepositoryDetails_v1beta1 {...props} />
        ),
      },
    },
    {
      kind: GitRepository_v1beta2.kind,
      apiVersions: GitRepository_v1beta2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<GitRepository_v1beta2>) => (
          <GitRepositoryDetails_v1beta2 {...props} />
        ),
      },
    },
    {
      kind: GitRepository_v1.kind,
      apiVersions: GitRepository_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<GitRepository_v1>) => (
          <GitRepositoryDetails_v1 {...props} />
        ),
      },
    },
    {
      kind: GitRepository_v1.kind,
      apiVersions: GitRepository_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<GitRepository_v1>) => (
          <GitRepositoryDetails_v1 {...props} />
        ),
      },
    },
    {
      kind: HelmChart_v1beta1.kind,
      apiVersions: HelmChart_v1beta1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmChart_v1beta1>) => (
          <HelmChartDetails_v1beta1 {...props} />
        ),
      },
    },
    {
      kind: HelmChart_v1beta2.kind,
      apiVersions: HelmChart_v1beta2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmChart_v1beta2>) => (
          <HelmChartDetails_v1beta2 {...props} />
        ),
      },
    },
    {
      kind: HelmChart_v1.kind,
      apiVersions: HelmChart_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmChart_v1>) => <HelmChartDetails_v1 {...props} />,
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
      kind: HelmRepository_v1beta1.kind,
      apiVersions: HelmRepository_v1beta1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmRepository_v1beta1>) => (
          <HelmRepositoryDetails_v1beta1 {...props} />
        ),
      },
    },
    {
      kind: HelmRepository_v1beta2.kind,
      apiVersions: HelmRepository_v1beta2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmRepository_v1beta2>) => (
          <HelmRepositoryDetails_v1beta2 {...props} />
        ),
      },
    },
    {
      kind: HelmRepository_v1.kind,
      apiVersions: HelmRepository_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmRepository_v1>) => (
          <HelmRepositoryDetails_v1 {...props} />
        ),
      },
    },
    {
      kind: ImagePolicy_v1beta1.kind,
      apiVersions: ImagePolicy_v1beta1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImagePolicy_v1beta1>) => (
          <ImagePolicyDetails_v1beta1 {...props} />
        ),
      },
    },
    {
      kind: ImagePolicy_v1beta2.kind,
      apiVersions: ImagePolicy_v1beta2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImagePolicy_v1beta2>) => (
          <ImagePolicyDetails_v1beta2 {...props} />
        ),
      },
    },
    {
      kind: ImagePolicy_v1.kind,
      apiVersions: ImagePolicy_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImagePolicy_v1>) => (
          <ImagePolicyDetails_v1 {...props} />
        ),
      },
    },
    {
      kind: ImageRepository_v1beta1.kind,
      apiVersions: ImageRepository_v1beta1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImageRepository_v1beta1>) => (
          <ImageRepositoryDetails_v1beta1 {...props} />
        ),
      },
    },
    {
      kind: ImageRepository_v1beta2.kind,
      apiVersions: ImageRepository_v1beta2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImageRepository_v1beta2>) => (
          <ImageRepositoryDetails_v1beta2 {...props} />
        ),
      },
    },
    {
      kind: ImageRepository_v1.kind,
      apiVersions: ImageRepository_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImageRepository_v1>) => (
          <ImageRepositoryDetails_v1 {...props} />
        ),
      },
    },
    {
      kind: ImageUpdateAutomation_v1beta1.kind,
      apiVersions: ImageUpdateAutomation_v1beta1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImageUpdateAutomation_v1beta1>) => (
          <ImageUpdateAutomationDetails_v1beta1 {...props} />
        ),
      },
    },
    {
      kind: ImageUpdateAutomation_v1beta2.kind,
      apiVersions: ImageUpdateAutomation_v1beta2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImageUpdateAutomation_v1beta2>) => (
          <ImageUpdateAutomationDetails_v1beta2 {...props} />
        ),
      },
    },
    {
      kind: ImageUpdateAutomation_v1.kind,
      apiVersions: ImageUpdateAutomation_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImageUpdateAutomation_v1>) => (
          <ImageUpdateAutomationDetails_v1 {...props} />
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
      kind: OCIRepository_v1beta2.kind,
      apiVersions: OCIRepository_v1beta2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<OCIRepository_v1beta2>) => (
          <OCIRepositoryDetails_v1beta2 {...props} />
        ),
      },
    },
    {
      kind: OCIRepository_v1.kind,
      apiVersions: OCIRepository_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<OCIRepository_v1>) => (
          <OCIRepositoryDetails_v1 {...props} />
        ),
      },
    },
    {
      kind: Provider_v1beta1.kind,
      apiVersions: Provider_v1beta1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Provider_v1beta1>) => (
          <ProviderDetails_v1beta1 {...props} />
        ),
      },
    },
    {
      kind: Provider_v1beta2.kind,
      apiVersions: Provider_v1beta2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Provider_v1beta2>) => (
          <ProviderDetails_v1beta2 {...props} />
        ),
      },
    },
    {
      kind: Provider_v1beta3.kind,
      apiVersions: Provider_v1beta3.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Provider_v1beta3>) => (
          <ProviderDetails_v1beta3 {...props} />
        ),
      },
    },
    {
      kind: Receiver_v1beta1.kind,
      apiVersions: Receiver_v1beta1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Receiver_v1beta1>) => (
          <ReceiverDetails_v1beta1 {...props} />
        ),
      },
    },
    {
      kind: Receiver_v1beta2.kind,
      apiVersions: Receiver_v1beta2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Receiver_v1beta2>) => (
          <ReceiverDetails_v1beta2 {...props} />
        ),
      },
    },
    {
      kind: Receiver_v1beta3.kind,
      apiVersions: Receiver_v1beta3.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Receiver_v1beta3>) => (
          <ReceiverDetails_v1beta3 {...props} />
        ),
      },
    },
    {
      kind: Receiver_v1.kind,
      apiVersions: Receiver_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Receiver_v1>) => <ReceiverDetails_v1 {...props} />,
      },
    },
    {
      kind: ResourceSet_v1.kind,
      apiVersions: ResourceSet_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ResourceSet_v1>) => (
          <ResourceSetDetails_v1 {...props} />
        ),
      },
    },
    {
      kind: ResourceSetInputProvider_v1.kind,
      apiVersions: ResourceSetInputProvider_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ResourceSetInputProvider_v1>) => (
          <ResourceSetInputProviderDetails_v1 {...props} />
        ),
      },
    },
  ];

  kubeObjectMenuItems = [
    {
      kind: Alert_v1beta1.kind,
      apiVersions: Alert_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Alert_v1beta1} />
        ),
      },
    },
    {
      kind: Alert_v1beta1.kind,
      apiVersions: Alert_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Alert_v1beta1} />
        ),
      },
    },
    {
      kind: Alert_v1beta2.kind,
      apiVersions: Alert_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Alert_v1beta2} />
        ),
      },
    },
    {
      kind: Alert_v1beta2.kind,
      apiVersions: Alert_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Alert_v1beta2} />
        ),
      },
    },
    {
      kind: Alert_v1beta3.kind,
      apiVersions: Alert_v1beta3.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Alert_v1beta3} />
        ),
      },
    },
    {
      kind: Alert_v1beta3.kind,
      apiVersions: Alert_v1beta3.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Alert_v1beta3} />
        ),
      },
    },
    {
      kind: Bucket_v1beta1.kind,
      apiVersions: Bucket_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Bucket_v1beta1} />
        ),
      },
    },
    {
      kind: Bucket_v1beta1.kind,
      apiVersions: Bucket_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Bucket_v1beta1} />
        ),
      },
    },
    {
      kind: Bucket_v1beta2.kind,
      apiVersions: Bucket_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Bucket_v1beta2} />
        ),
      },
    },
    {
      kind: Bucket_v1beta2.kind,
      apiVersions: Bucket_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Bucket_v1beta2} />
        ),
      },
    },
    {
      kind: Bucket_v1.kind,
      apiVersions: Bucket_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Bucket_v1} />
        ),
      },
    },
    {
      kind: Bucket_v1.kind,
      apiVersions: Bucket_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Bucket_v1} />
        ),
      },
    },
    {
      kind: FluxInstance_v1.kind,
      apiVersions: FluxInstance_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={FluxInstance_v1} />
        ),
      },
    },
    {
      kind: FluxInstance_v1.kind,
      apiVersions: FluxInstance_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectAnnotationSuspendResumeMenuItem {...props} resource={FluxInstance_v1} />
        ),
      },
    },
    {
      kind: FluxReport_v1.kind,
      apiVersions: FluxReport_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={FluxReport_v1} />
        ),
      },
    },
    {
      kind: FluxReport_v1.kind,
      apiVersions: FluxReport_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectAnnotationSuspendResumeMenuItem {...props} resource={FluxReport_v1} />
        ),
      },
    },
    {
      kind: GitRepository_v1beta1.kind,
      apiVersions: GitRepository_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={GitRepository_v1beta1} />
        ),
      },
    },
    {
      kind: GitRepository_v1beta1.kind,
      apiVersions: GitRepository_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={GitRepository_v1beta1} />
        ),
      },
    },
    {
      kind: GitRepository_v1beta2.kind,
      apiVersions: GitRepository_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={GitRepository_v1beta2} />
        ),
      },
    },
    {
      kind: GitRepository_v1beta2.kind,
      apiVersions: GitRepository_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={GitRepository_v1beta2} />
        ),
      },
    },
    {
      kind: GitRepository_v1.kind,
      apiVersions: GitRepository_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={GitRepository_v1} />
        ),
      },
    },
    {
      kind: GitRepository_v1.kind,
      apiVersions: GitRepository_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={GitRepository_v1} />
        ),
      },
    },
    {
      kind: HelmChart_v1beta1.kind,
      apiVersions: HelmChart_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={HelmChart_v1beta1} />
        ),
      },
    },
    {
      kind: HelmChart_v1beta1.kind,
      apiVersions: HelmChart_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={HelmChart_v1beta1} />
        ),
      },
    },
    {
      kind: HelmChart_v1beta2.kind,
      apiVersions: HelmChart_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={HelmChart_v1beta2} />
        ),
      },
    },
    {
      kind: HelmChart_v1beta2.kind,
      apiVersions: HelmChart_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={HelmChart_v1beta2} />
        ),
      },
    },
    {
      kind: HelmChart_v1.kind,
      apiVersions: HelmChart_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={HelmChart_v1} />
        ),
      },
    },
    {
      kind: HelmChart_v1.kind,
      apiVersions: HelmChart_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={HelmChart_v1} />
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
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={HelmRelease_v2beta1} />
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
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={HelmRelease_v2beta2} />
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
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={HelmRelease_v2} />
        ),
      },
    },
    {
      kind: HelmRepository_v1.kind,
      apiVersions: HelmRepository_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={HelmRepository_v1} />
        ),
      },
    },
    {
      kind: HelmRepository_v1.kind,
      apiVersions: HelmRepository_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={HelmRepository_v1} />
        ),
      },
    },
    {
      kind: ImagePolicy_v1beta1.kind,
      apiVersions: ImagePolicy_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={ImagePolicy_v1beta1} />
        ),
      },
    },
    {
      kind: ImagePolicy_v1beta2.kind,
      apiVersions: ImagePolicy_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={ImagePolicy_v1beta2} />
        ),
      },
    },
    {
      kind: ImagePolicy_v1.kind,
      apiVersions: ImagePolicy_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={ImagePolicy_v1} />
        ),
      },
    },
    {
      kind: ImageRepository_v1beta1.kind,
      apiVersions: ImageRepository_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={ImageRepository_v1beta1} />
        ),
      },
    },
    {
      kind: ImageRepository_v1beta1.kind,
      apiVersions: ImageRepository_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={ImageRepository_v1beta1} />
        ),
      },
    },
    {
      kind: ImageRepository_v1beta2.kind,
      apiVersions: ImageRepository_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={ImageRepository_v1beta2} />
        ),
      },
    },
    {
      kind: ImageRepository_v1beta2.kind,
      apiVersions: ImageRepository_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={ImageRepository_v1beta2} />
        ),
      },
    },
    {
      kind: ImageRepository_v1.kind,
      apiVersions: ImageRepository_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={ImageRepository_v1} />
        ),
      },
    },
    {
      kind: ImageRepository_v1.kind,
      apiVersions: ImageRepository_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={ImageRepository_v1} />
        ),
      },
    },
    {
      kind: ImageUpdateAutomation_v1beta1.kind,
      apiVersions: ImageUpdateAutomation_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={ImageUpdateAutomation_v1beta1} />
        ),
      },
    },
    {
      kind: ImageUpdateAutomation_v1beta1.kind,
      apiVersions: ImageUpdateAutomation_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={ImageUpdateAutomation_v1beta1} />
        ),
      },
    },
    {
      kind: ImageUpdateAutomation_v1beta2.kind,
      apiVersions: ImageUpdateAutomation_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={ImageUpdateAutomation_v1beta2} />
        ),
      },
    },
    {
      kind: ImageUpdateAutomation_v1beta2.kind,
      apiVersions: ImageUpdateAutomation_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={ImageUpdateAutomation_v1beta2} />
        ),
      },
    },
    {
      kind: ImageUpdateAutomation_v1.kind,
      apiVersions: ImageUpdateAutomation_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={ImageUpdateAutomation_v1} />
        ),
      },
    },
    {
      kind: ImageUpdateAutomation_v1.kind,
      apiVersions: ImageUpdateAutomation_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={ImageUpdateAutomation_v1} />
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
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Kustomization_v1beta1} />
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
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Kustomization_v1beta2} />
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
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Kustomization_v1} />
        ),
      },
    },
    {
      kind: OCIRepository_v1beta2.kind,
      apiVersions: OCIRepository_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={OCIRepository_v1beta2} />
        ),
      },
    },
    {
      kind: OCIRepository_v1beta2.kind,
      apiVersions: OCIRepository_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={OCIRepository_v1beta2} />
        ),
      },
    },
    {
      kind: OCIRepository_v1.kind,
      apiVersions: OCIRepository_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={OCIRepository_v1} />
        ),
      },
    },
    {
      kind: OCIRepository_v1.kind,
      apiVersions: OCIRepository_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={OCIRepository_v1} />
        ),
      },
    },
    {
      kind: Provider_v1beta1.kind,
      apiVersions: Provider_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Provider_v1beta1} />
        ),
      },
    },
    {
      kind: Provider_v1beta1.kind,
      apiVersions: Provider_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Provider_v1beta1} />
        ),
      },
    },
    {
      kind: Provider_v1beta2.kind,
      apiVersions: Provider_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Provider_v1beta2} />
        ),
      },
    },
    {
      kind: Provider_v1beta2.kind,
      apiVersions: Provider_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Provider_v1beta2} />
        ),
      },
    },
    {
      kind: Provider_v1beta3.kind,
      apiVersions: Provider_v1beta3.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Provider_v1beta3} />
        ),
      },
    },
    {
      kind: Provider_v1beta3.kind,
      apiVersions: Provider_v1beta3.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Provider_v1beta3} />
        ),
      },
    },
    {
      kind: Receiver_v1beta1.kind,
      apiVersions: Receiver_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Receiver_v1beta1} />
        ),
      },
    },
    {
      kind: Receiver_v1beta1.kind,
      apiVersions: Receiver_v1beta1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Receiver_v1beta1} />
        ),
      },
    },
    {
      kind: Receiver_v1beta2.kind,
      apiVersions: Receiver_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Receiver_v1beta2} />
        ),
      },
    },
    {
      kind: Receiver_v1beta2.kind,
      apiVersions: Receiver_v1beta2.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Receiver_v1beta2} />
        ),
      },
    },
    {
      kind: Receiver_v1beta3.kind,
      apiVersions: Receiver_v1beta3.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Receiver_v1beta3} />
        ),
      },
    },
    {
      kind: Receiver_v1beta3.kind,
      apiVersions: Receiver_v1beta3.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Receiver_v1beta3} />
        ),
      },
    },
    {
      kind: Receiver_v1.kind,
      apiVersions: Receiver_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={Receiver_v1} />
        ),
      },
    },
    {
      kind: Receiver_v1.kind,
      apiVersions: Receiver_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={Receiver_v1} />
        ),
      },
    },
    {
      kind: ResourceSet_v1.kind,
      apiVersions: ResourceSet_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={ResourceSet_v1} />
        ),
      },
    },
    {
      kind: ResourceSet_v1.kind,
      apiVersions: ResourceSet_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectAnnotationSuspendResumeMenuItem {...props} resource={ResourceSet_v1} />
        ),
      },
    },
    {
      kind: ResourceSetInputProvider_v1.kind,
      apiVersions: ResourceSetInputProvider_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectReconcileMenuItemProps) => (
          <FluxCDObjectReconcileMenuItem {...props} resource={ResourceSetInputProvider_v1} />
        ),
      },
    },
    {
      kind: ResourceSetInputProvider_v1.kind,
      apiVersions: ResourceSetInputProvider_v1.crd.apiVersions,
      components: {
        MenuItem: (props: FluxCDObjectSpecSuspendResumeMenuItemProps) => (
          <FluxCDObjectAnnotationSuspendResumeMenuItem {...props} resource={ResourceSetInputProvider_v1} />
        ),
      },
    },
  ];
}
