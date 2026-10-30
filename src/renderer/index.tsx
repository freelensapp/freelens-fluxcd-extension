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
import { AlertDetails as AlertDetails_v1 } from "./components/details/notification/alert-details-v1";
import { AlertDetails as AlertDetails_v1beta1 } from "./components/details/notification/alert-details-v1beta1";
import { AlertDetails as AlertDetails_v1beta2 } from "./components/details/notification/alert-details-v1beta2";
import { AlertDetails as AlertDetails_v1beta3 } from "./components/details/notification/alert-details-v1beta3";
import { ProviderDetails as ProviderDetails_v1 } from "./components/details/notification/provider-details-v1";
import { ProviderDetails as ProviderDetails_v1beta1 } from "./components/details/notification/provider-details-v1beta1";
import { ProviderDetails as ProviderDetails_v1beta2 } from "./components/details/notification/provider-details-v1beta2";
import { ProviderDetails as ProviderDetails_v1beta3 } from "./components/details/notification/provider-details-v1beta3";
import { ReceiverDetails as ReceiverDetails_v1 } from "./components/details/notification/receiver-details-v1";
import { ReceiverDetails as ReceiverDetails_v1beta1 } from "./components/details/notification/receiver-details-v1beta1";
import { ReceiverDetails as ReceiverDetails_v1beta2 } from "./components/details/notification/receiver-details-v1beta2";
import { ReceiverDetails as ReceiverDetails_v1beta3 } from "./components/details/notification/receiver-details-v1beta3";
import { ArtifactGeneratorDetails as ArtifactGeneratorDetails_v1beta1 } from "./components/details/source/artifact-generator-details-v1beta1";
import { BucketDetails as BucketDetails_v1 } from "./components/details/source/bucket-details-v1";
import { BucketDetails as BucketDetails_v1beta1 } from "./components/details/source/bucket-details-v1beta1";
import { BucketDetails as BucketDetails_v1beta2 } from "./components/details/source/bucket-details-v1beta2";
import { ExternalArtifactDetails as ExternalArtifactDetails_v1 } from "./components/details/source/external-artifact-details-v1";
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
import {
  withDetailsErrorBoundary,
  withMenuItemErrorBoundary,
  withPageErrorBoundary,
} from "./components/error-boundary";
import svgIcon from "./icons/fluxcd.svg?raw";
import { FluxInstance as FluxInstance_v1 } from "./k8s/fluxcd/controlplane/fluxinstance-v1";
import { FluxReport as FluxReport_v1 } from "./k8s/fluxcd/controlplane/fluxreport-v1";
import { ResourceSet as ResourceSet_v1 } from "./k8s/fluxcd/controlplane/resourceset-v1";
import { ResourceSetInputProvider as ResourceSetInputProvider_v1 } from "./k8s/fluxcd/controlplane/resourcesetinputprovider-v1";
import { fluxOperatorReconcileAnnotation } from "./k8s/fluxcd/controlplane/types";
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
import { Alert as Alert_v1 } from "./k8s/fluxcd/notification/alert-v1";
import { Alert as Alert_v1beta1 } from "./k8s/fluxcd/notification/alert-v1beta1";
import { Alert as Alert_v1beta2 } from "./k8s/fluxcd/notification/alert-v1beta2";
import { Alert as Alert_v1beta3 } from "./k8s/fluxcd/notification/alert-v1beta3";
import { Provider as Provider_v1 } from "./k8s/fluxcd/notification/provider-v1";
import { Provider as Provider_v1beta1 } from "./k8s/fluxcd/notification/provider-v1beta1";
import { Provider as Provider_v1beta2 } from "./k8s/fluxcd/notification/provider-v1beta2";
import { Provider as Provider_v1beta3 } from "./k8s/fluxcd/notification/provider-v1beta3";
import { Receiver as Receiver_v1 } from "./k8s/fluxcd/notification/receiver-v1";
import { Receiver as Receiver_v1beta1 } from "./k8s/fluxcd/notification/receiver-v1beta1";
import { Receiver as Receiver_v1beta2 } from "./k8s/fluxcd/notification/receiver-v1beta2";
import { Receiver as Receiver_v1beta3 } from "./k8s/fluxcd/notification/receiver-v1beta3";
import {
  ArtifactGenerator as ArtifactGenerator_v1beta1,
  sourceWatcherReconcileAnnotation,
} from "./k8s/fluxcd/source/artifactgenerator-v1beta1";
import { Bucket as Bucket_v1 } from "./k8s/fluxcd/source/bucket-v1";
import { Bucket as Bucket_v1beta1 } from "./k8s/fluxcd/source/bucket-v1beta1";
import { Bucket as Bucket_v1beta2 } from "./k8s/fluxcd/source/bucket-v1beta2";
import { ExternalArtifact as ExternalArtifact_v1 } from "./k8s/fluxcd/source/externalartifact-v1";
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
import { FluxCDObjectReconcileMenuItem } from "./menus/fluxcd-object-reconcile-menu-item";
import { FluxCDObjectSpecSuspendResumeMenuItem } from "./menus/fluxcd-object-spec-suspend-resume-menu-item";
import { createAvailableVersionPage } from "./pages/available-version";
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
import { AlertsPage as AlertsPage_v1 } from "./pages/notifications/alerts-v1";
import { AlertsPage as AlertsPage_v1beta1 } from "./pages/notifications/alerts-v1beta1";
import { AlertsPage as AlertsPage_v1beta2 } from "./pages/notifications/alerts-v1beta2";
import { AlertsPage as AlertsPage_v1beta3 } from "./pages/notifications/alerts-v1beta3";
import { ProvidersPage as ProvidersPage_v1 } from "./pages/notifications/providers-v1";
import { ProvidersPage as ProvidersPage_v1beta1 } from "./pages/notifications/providers-v1beta1";
import { ProvidersPage as ProvidersPage_v1beta2 } from "./pages/notifications/providers-v1beta2";
import { ProvidersPage as ProvidersPage_v1beta3 } from "./pages/notifications/providers-v1beta3";
import { ReceiversPage as ReceiversPage_v1 } from "./pages/notifications/receivers-v1";
import { ReceiversPage as ReceiversPage_v1beta1 } from "./pages/notifications/receivers-v1beta1";
import { ReceiversPage as ReceiversPage_v1beta2 } from "./pages/notifications/receivers-v1beta2";
import { ReceiversPage as ReceiversPage_v1beta3 } from "./pages/notifications/receivers-v1beta3";
import { FluxCDOverviewPage } from "./pages/overview";
import { ArtifactGeneratorsPage as ArtifactGeneratorsPage_v1beta1 } from "./pages/source/artifactgenerators-v1beta1";
import { BucketsPage as BucketsPage_v1 } from "./pages/source/buckets-v1";
import { BucketsPage as BucketsPage_v1beta1 } from "./pages/source/buckets-v1beta1";
import { BucketsPage as BucketsPage_v1beta2 } from "./pages/source/buckets-v1beta2";
import { ExternalArtifactsPage as ExternalArtifactsPage_v1 } from "./pages/source/externalartifacts-v1";
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

const AlertsPage = createAvailableVersionPage("Alerts", [
  { kubeObjectClass: Alert_v1, PageComponent: AlertsPage_v1, version: "v1" },
  { kubeObjectClass: Alert_v1beta3, PageComponent: AlertsPage_v1beta3, version: "v1beta3" },
  { kubeObjectClass: Alert_v1beta2, PageComponent: AlertsPage_v1beta2, version: "v1beta2" },
  { kubeObjectClass: Alert_v1beta1, PageComponent: AlertsPage_v1beta1, version: "v1beta1" },
]);

const ArtifactGeneratorsPage = createAvailableVersionPage("Artifact Generators", [
  { kubeObjectClass: ArtifactGenerator_v1beta1, PageComponent: ArtifactGeneratorsPage_v1beta1, version: "v1beta1" },
]);

const BucketsPage = createAvailableVersionPage("Buckets", [
  { kubeObjectClass: Bucket_v1, PageComponent: BucketsPage_v1, version: "v1" },
  { kubeObjectClass: Bucket_v1beta2, PageComponent: BucketsPage_v1beta2, version: "v1beta2" },
  { kubeObjectClass: Bucket_v1beta1, PageComponent: BucketsPage_v1beta1, version: "v1beta1" },
]);

const ExternalArtifactsPage = createAvailableVersionPage("External Artifacts", [
  { kubeObjectClass: ExternalArtifact_v1, PageComponent: ExternalArtifactsPage_v1, version: "v1" },
]);

const FluxInstancesPage = createAvailableVersionPage("Flux Instances", [
  { kubeObjectClass: FluxInstance_v1, PageComponent: FluxInstancesPage_v1, version: "v1" },
]);

const FluxReportsPage = createAvailableVersionPage("Flux Reports", [
  { kubeObjectClass: FluxReport_v1, PageComponent: FluxReportsPage_v1, version: "v1" },
]);

const GitRepositoriesPage = createAvailableVersionPage("Git Repositories", [
  { kubeObjectClass: GitRepository_v1, PageComponent: GitRepositoriesPage_v1, version: "v1" },
  { kubeObjectClass: GitRepository_v1beta2, PageComponent: GitRepositoriesPage_v1beta2, version: "v1beta2" },
  { kubeObjectClass: GitRepository_v1beta1, PageComponent: GitRepositoriesPage_v1beta1, version: "v1beta1" },
]);

const HelmChartsPage = createAvailableVersionPage("Helm Charts", [
  { kubeObjectClass: HelmChart_v1, PageComponent: HelmChartsPage_v1, version: "v1" },
  { kubeObjectClass: HelmChart_v1beta2, PageComponent: HelmChartsPage_v1beta2, version: "v1beta2" },
  { kubeObjectClass: HelmChart_v1beta1, PageComponent: HelmChartsPage_v1beta1, version: "v1beta1" },
]);

const HelmReleasesPage = createAvailableVersionPage("Helm Releases", [
  { kubeObjectClass: HelmRelease_v2, PageComponent: HelmReleasesPage_v2, version: "v2" },
  { kubeObjectClass: HelmRelease_v2beta2, PageComponent: HelmReleasesPage_v2beta2, version: "v2beta2" },
  { kubeObjectClass: HelmRelease_v2beta1, PageComponent: HelmReleasesPage_v2beta1, version: "v2beta1" },
]);

const HelmRepositoriesPage = createAvailableVersionPage("Helm Repositories", [
  { kubeObjectClass: HelmRepository_v1, PageComponent: HelmRepositoriesPage_v1, version: "v1" },
  { kubeObjectClass: HelmRepository_v1beta2, PageComponent: HelmRepositoriesPage_v1beta2, version: "v1beta2" },
  { kubeObjectClass: HelmRepository_v1beta1, PageComponent: HelmRepositoriesPage_v1beta1, version: "v1beta1" },
]);

const ImagePoliciesPage = createAvailableVersionPage("Image Policies", [
  { kubeObjectClass: ImagePolicy_v1, PageComponent: ImagePoliciesPage_v1, version: "v1" },
  { kubeObjectClass: ImagePolicy_v1beta2, PageComponent: ImagePoliciesPage_v1beta2, version: "v1beta2" },
  { kubeObjectClass: ImagePolicy_v1beta1, PageComponent: ImagePoliciesPage_v1beta1, version: "v1beta1" },
]);

const ImageRepositoriesPage = createAvailableVersionPage("Image Repositories", [
  { kubeObjectClass: ImageRepository_v1, PageComponent: ImageRepositoriesPage_v1, version: "v1" },
  {
    kubeObjectClass: ImageRepository_v1beta2,
    PageComponent: ImageRepositoriesPage_v1beta2,
    version: "v1beta2",
  },
  {
    kubeObjectClass: ImageRepository_v1beta1,
    PageComponent: ImageRepositoriesPage_v1beta1,
    version: "v1beta1",
  },
]);

const ImageUpdateAutomationsPage = createAvailableVersionPage("Image Update Automations", [
  { kubeObjectClass: ImageUpdateAutomation_v1, PageComponent: ImageUpdateAutomationsPage_v1, version: "v1" },
  {
    kubeObjectClass: ImageUpdateAutomation_v1beta2,
    PageComponent: ImageUpdateAutomationsPage_v1beta2,
    version: "v1beta2",
  },
  {
    kubeObjectClass: ImageUpdateAutomation_v1beta1,
    PageComponent: ImageUpdateAutomationsPage_v1beta1,
    version: "v1beta1",
  },
]);

const KustomizationsPage = createAvailableVersionPage("Kustomizations", [
  { kubeObjectClass: Kustomization_v1, PageComponent: KustomizationsPage_v1, version: "v1" },
  { kubeObjectClass: Kustomization_v1beta2, PageComponent: KustomizationsPage_v1beta2, version: "v1beta2" },
  { kubeObjectClass: Kustomization_v1beta1, PageComponent: KustomizationsPage_v1beta1, version: "v1beta1" },
]);

const OCIRepositoriesPage = createAvailableVersionPage("OCI Repositories", [
  { kubeObjectClass: OCIRepository_v1, PageComponent: OCIRepositoriesPage_v1, version: "v1" },
  { kubeObjectClass: OCIRepository_v1beta2, PageComponent: OCIRepositoriesPage_v1beta2, version: "v1beta2" },
]);

const ProvidersPage = createAvailableVersionPage("Providers", [
  { kubeObjectClass: Provider_v1, PageComponent: ProvidersPage_v1, version: "v1" },
  { kubeObjectClass: Provider_v1beta3, PageComponent: ProvidersPage_v1beta3, version: "v1beta3" },
  { kubeObjectClass: Provider_v1beta2, PageComponent: ProvidersPage_v1beta2, version: "v1beta2" },
  { kubeObjectClass: Provider_v1beta1, PageComponent: ProvidersPage_v1beta1, version: "v1beta1" },
]);

const ReceiversPage = createAvailableVersionPage("Receivers", [
  { kubeObjectClass: Receiver_v1, PageComponent: ReceiversPage_v1, version: "v1" },
  { kubeObjectClass: Receiver_v1beta3, PageComponent: ReceiversPage_v1beta3, version: "v1beta3" },
  { kubeObjectClass: Receiver_v1beta2, PageComponent: ReceiversPage_v1beta2, version: "v1beta2" },
  { kubeObjectClass: Receiver_v1beta1, PageComponent: ReceiversPage_v1beta1, version: "v1beta1" },
]);

const ResourceSetsPage = createAvailableVersionPage("Resource Sets", [
  { kubeObjectClass: ResourceSet_v1, PageComponent: ResourceSetsPage_v1, version: "v1" },
]);

const ResourceSetInputProvidersPage = createAvailableVersionPage("Resource Set Input Providers", [
  {
    kubeObjectClass: ResourceSetInputProvider_v1,
    PageComponent: ResourceSetInputProvidersPage_v1,
    version: "v1",
  },
]);

// Every page of a kind, each with the model classes of all its versions, for `customResources`.
const availableVersionPages = [
  AlertsPage,
  ArtifactGeneratorsPage,
  BucketsPage,
  ExternalArtifactsPage,
  FluxInstancesPage,
  FluxReportsPage,
  GitRepositoriesPage,
  HelmChartsPage,
  HelmReleasesPage,
  HelmRepositoriesPage,
  ImagePoliciesPage,
  ImageRepositoriesPage,
  ImageUpdateAutomationsPage,
  KustomizationsPage,
  OCIRepositoriesPage,
  ProvidersPage,
  ReceiversPage,
  ResourceSetsPage,
  ResourceSetInputProvidersPage,
];

// The kinds that `spec.suspend` suspends, every version: each gets Reconcile and the spec Suspend/Resume item.
const specSuspendClasses = [
  Alert_v1beta1,
  Alert_v1beta2,
  Alert_v1beta3,
  Alert_v1,
  Bucket_v1beta1,
  Bucket_v1beta2,
  Bucket_v1,
  GitRepository_v1beta1,
  GitRepository_v1beta2,
  GitRepository_v1,
  HelmChart_v1beta1,
  HelmChart_v1beta2,
  HelmChart_v1,
  HelmRelease_v2beta1,
  HelmRelease_v2beta2,
  HelmRelease_v2,
  HelmRepository_v1beta1,
  HelmRepository_v1beta2,
  HelmRepository_v1,
  ImagePolicy_v1beta2,
  ImagePolicy_v1,
  ImageRepository_v1beta1,
  ImageRepository_v1beta2,
  ImageRepository_v1,
  ImageUpdateAutomation_v1beta1,
  ImageUpdateAutomation_v1beta2,
  ImageUpdateAutomation_v1,
  Kustomization_v1beta1,
  Kustomization_v1beta2,
  Kustomization_v1,
  OCIRepository_v1beta2,
  OCIRepository_v1,
  Provider_v1beta1,
  Provider_v1beta2,
  Provider_v1beta3,
  Provider_v1,
  Receiver_v1beta1,
  Receiver_v1beta2,
  Receiver_v1beta3,
  Receiver_v1,
];

// The kinds that an annotation suspends, every version, with the annotation: each gets Reconcile and the
// annotation Suspend/Resume item.
const annotationSuspendClasses = [
  { kubeObjectClass: ArtifactGenerator_v1beta1, annotation: sourceWatcherReconcileAnnotation },
  { kubeObjectClass: FluxInstance_v1, annotation: fluxOperatorReconcileAnnotation },
  { kubeObjectClass: FluxReport_v1, annotation: fluxOperatorReconcileAnnotation },
  { kubeObjectClass: ResourceSet_v1, annotation: fluxOperatorReconcileAnnotation },
  { kubeObjectClass: ResourceSetInputProvider_v1, annotation: fluxOperatorReconcileAnnotation },
];

// Every page, details panel and menu item of the extension renders inside an error boundary, so that an error it
// throws stays in its place: the host has none around the details drawer or a menu item, and the boundary of the
// cluster frame would replace the whole cluster view. Each registration field is mapped through its wrapper, so an
// entry added to it is wrapped too.
export default class FluxCDExtension extends Renderer.LensExtension {
  clusterPages: Renderer.LensExtension["clusterPages"] = [
    {
      id: "dashboard",
      components: {
        Page: () => <FluxCDOverviewPage extension={this} />,
      },
    },
    {
      id: "alert",
      components: {
        Page: () => <AlertsPage extension={this} />,
      },
    },
    {
      id: "artifactgenerator",
      components: {
        Page: () => <ArtifactGeneratorsPage extension={this} />,
      },
    },
    {
      id: "bucket",
      components: {
        Page: () => <BucketsPage extension={this} />,
      },
    },
    {
      id: "externalartifact",
      components: {
        Page: () => <ExternalArtifactsPage extension={this} />,
      },
    },
    {
      id: "fluxinstance",
      components: {
        Page: () => <FluxInstancesPage extension={this} />,
      },
    },
    {
      id: "fluxreport",
      components: {
        Page: () => <FluxReportsPage extension={this} />,
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
        Page: () => <HelmReleasesPage extension={this} />,
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
        Page: () => <KustomizationsPage extension={this} />,
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
    {
      id: "resourceset",
      components: {
        Page: () => <ResourceSetsPage extension={this} />,
      },
    },
    {
      id: "resourcesetinputprovider",
      components: {
        Page: () => <ResourceSetInputProvidersPage extension={this} />,
      },
    },
  ].map((registration) => withPageErrorBoundary(this, registration));

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
      id: "externalartifact",
      parentId: "source",
      target: { pageId: "externalartifact" },
      title: ExternalArtifact_v1.crd.title,
      components: {},
    },
    {
      id: "artifactgenerator",
      parentId: "source",
      target: { pageId: "artifactgenerator" },
      title: ArtifactGenerator_v1beta1.crd.title,
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
      id: "alert",
      parentId: "notification",
      target: { pageId: "alert" },
      title: Alert_v1.crd.title,
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
      id: "provider",
      parentId: "notification",
      target: { pageId: "provider" },
      title: Provider_v1.crd.title,
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

  // The kinds with a page of their own, every version, so that the Custom Resources tree does not list them again.
  customResources = availableVersionPages.flatMap((page) => page.kubeObjectClasses);

  kubeObjectDetailItems: Renderer.LensExtension["kubeObjectDetailItems"] = [
    Renderer.K8sApi.detailsFor(Alert_v1beta1, {
      priority: 10,
      Details: (props) => <AlertDetails_v1beta1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Alert_v1beta2, {
      priority: 10,
      Details: (props) => <AlertDetails_v1beta2 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Alert_v1beta3, {
      priority: 10,
      Details: (props) => <AlertDetails_v1beta3 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Alert_v1, {
      priority: 10,
      Details: (props) => <AlertDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(ArtifactGenerator_v1beta1, {
      priority: 10,
      Details: (props) => <ArtifactGeneratorDetails_v1beta1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Bucket_v1beta1, {
      priority: 10,
      Details: (props) => <BucketDetails_v1beta1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Bucket_v1beta2, {
      priority: 10,
      Details: (props) => <BucketDetails_v1beta2 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Bucket_v1, {
      priority: 10,
      Details: (props) => <BucketDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(ExternalArtifact_v1, {
      priority: 10,
      Details: (props) => <ExternalArtifactDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(FluxInstance_v1, {
      priority: 10,
      Details: (props) => <FluxInstanceDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(FluxReport_v1, {
      priority: 10,
      Details: (props) => <FluxReportDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(GitRepository_v1beta1, {
      priority: 10,
      Details: (props) => <GitRepositoryDetails_v1beta1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(GitRepository_v1beta2, {
      priority: 10,
      Details: (props) => <GitRepositoryDetails_v1beta2 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(GitRepository_v1, {
      priority: 10,
      Details: (props) => <GitRepositoryDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(HelmChart_v1beta1, {
      priority: 10,
      Details: (props) => <HelmChartDetails_v1beta1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(HelmChart_v1beta2, {
      priority: 10,
      Details: (props) => <HelmChartDetails_v1beta2 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(HelmChart_v1, {
      priority: 10,
      Details: (props) => <HelmChartDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(HelmRelease_v2beta1, {
      priority: 10,
      Details: (props) => <HelmReleaseDetails_v2beta1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(HelmRelease_v2beta2, {
      priority: 10,
      Details: (props) => <HelmReleaseDetails_v2beta2 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(HelmRelease_v2, {
      priority: 10,
      Details: (props) => <HelmReleaseDetails_v2 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(HelmRepository_v1beta1, {
      priority: 10,
      Details: (props) => <HelmRepositoryDetails_v1beta1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(HelmRepository_v1beta2, {
      priority: 10,
      Details: (props) => <HelmRepositoryDetails_v1beta2 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(HelmRepository_v1, {
      priority: 10,
      Details: (props) => <HelmRepositoryDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(ImagePolicy_v1beta1, {
      priority: 10,
      Details: (props) => <ImagePolicyDetails_v1beta1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(ImagePolicy_v1beta2, {
      priority: 10,
      Details: (props) => <ImagePolicyDetails_v1beta2 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(ImagePolicy_v1, {
      priority: 10,
      Details: (props) => <ImagePolicyDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(ImageRepository_v1beta1, {
      priority: 10,
      Details: (props) => <ImageRepositoryDetails_v1beta1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(ImageRepository_v1beta2, {
      priority: 10,
      Details: (props) => <ImageRepositoryDetails_v1beta2 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(ImageRepository_v1, {
      priority: 10,
      Details: (props) => <ImageRepositoryDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(ImageUpdateAutomation_v1beta1, {
      priority: 10,
      Details: (props) => <ImageUpdateAutomationDetails_v1beta1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(ImageUpdateAutomation_v1beta2, {
      priority: 10,
      Details: (props) => <ImageUpdateAutomationDetails_v1beta2 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(ImageUpdateAutomation_v1, {
      priority: 10,
      Details: (props) => <ImageUpdateAutomationDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Kustomization_v1beta1, {
      priority: 10,
      Details: (props) => <KustomizationDetails_v1beta1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Kustomization_v1beta2, {
      priority: 10,
      Details: (props) => <KustomizationDetails_v1beta2 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Kustomization_v1, {
      priority: 10,
      Details: (props) => <KustomizationDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(OCIRepository_v1beta2, {
      priority: 10,
      Details: (props) => <OCIRepositoryDetails_v1beta2 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(OCIRepository_v1, {
      priority: 10,
      Details: (props) => <OCIRepositoryDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Provider_v1beta1, {
      priority: 10,
      Details: (props) => <ProviderDetails_v1beta1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Provider_v1beta2, {
      priority: 10,
      Details: (props) => <ProviderDetails_v1beta2 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Provider_v1beta3, {
      priority: 10,
      Details: (props) => <ProviderDetails_v1beta3 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Provider_v1, {
      priority: 10,
      Details: (props) => <ProviderDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Receiver_v1beta1, {
      priority: 10,
      Details: (props) => <ReceiverDetails_v1beta1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Receiver_v1beta2, {
      priority: 10,
      Details: (props) => <ReceiverDetails_v1beta2 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Receiver_v1beta3, {
      priority: 10,
      Details: (props) => <ReceiverDetails_v1beta3 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(Receiver_v1, {
      priority: 10,
      Details: (props) => <ReceiverDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(ResourceSet_v1, {
      priority: 10,
      Details: (props) => <ResourceSetDetails_v1 {...props} />,
    }),
    Renderer.K8sApi.detailsFor(ResourceSetInputProvider_v1, {
      priority: 10,
      Details: (props) => <ResourceSetInputProviderDetails_v1 {...props} />,
    }),
  ].map((registration) => withDetailsErrorBoundary(this, registration));

  // In a list, `kubeObjectClass` is the union of its classes, from which `menuItemFor` would infer the object type of
  // one of them and reject the others. The type argument is the union of their objects instead, so the menu item is
  // checked against the objects of every class in the list.
  kubeObjectMenuItems: Renderer.LensExtension["kubeObjectMenuItems"] = [
    ...specSuspendClasses.flatMap((kubeObjectClass) => [
      Renderer.K8sApi.menuItemFor<InstanceType<typeof kubeObjectClass>>(kubeObjectClass, {
        MenuItem: (props) => <FluxCDObjectReconcileMenuItem {...props} resource={kubeObjectClass} />,
      }),
      Renderer.K8sApi.menuItemFor<InstanceType<typeof kubeObjectClass>>(kubeObjectClass, {
        MenuItem: (props) => <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={kubeObjectClass} />,
      }),
    ]),
    // ImagePolicy v1beta1 has no `spec.suspend`, and gets Reconcile only.
    Renderer.K8sApi.menuItemFor(ImagePolicy_v1beta1, {
      MenuItem: (props) => <FluxCDObjectReconcileMenuItem {...props} resource={ImagePolicy_v1beta1} />,
    }),
    ...annotationSuspendClasses.flatMap(({ kubeObjectClass, annotation }) => [
      Renderer.K8sApi.menuItemFor<InstanceType<typeof kubeObjectClass>>(kubeObjectClass, {
        MenuItem: (props) => <FluxCDObjectReconcileMenuItem {...props} resource={kubeObjectClass} />,
      }),
      Renderer.K8sApi.menuItemFor<InstanceType<typeof kubeObjectClass>>(kubeObjectClass, {
        MenuItem: (props) => (
          <FluxCDObjectAnnotationSuspendResumeMenuItem {...props} resource={kubeObjectClass} annotation={annotation} />
        ),
      }),
    ]),
  ].map((registration) => withMenuItemErrorBoundary(this, registration));
}
