import { Renderer } from "@freelensapp/extensions";

// @ts-ignore
import React from "react";

import {
  FluxcdObjectReconcileMenuItem,
  FluxcdObjectReconcileMenuItemProps,
} from "./menus/fluxcd-object-reconcile-menu-item";
import {
  FluxCdObjectSuspendResumeMenuItemProps,
  FluxcdObjectSuspendResumeMenuItem,
} from "./menus/fluxcd-object-suspend-resume-menu-item";

import { FluxCDDashboard } from "./pages/dashboard";
import { FluxCDHelmReleases } from "./pages/helm/helmreleases";
import { FluxCDImagePolicies } from "./pages/imageautomation/imagepolicies";
import { FluxCDImageRepositories } from "./pages/imageautomation/imagerepositories";
import { FluxCDImageUpdateAutomations } from "./pages/imageautomation/imageupdateautomations";
import { FluxCDKustomizations } from "./pages/kustomizations/kustomizations";
import { FluxCDAlerts } from "./pages/notifications/alerts";
import { FluxCDProviders } from "./pages/notifications/providers";
import { FluxCDReceivers } from "./pages/notifications/receivers";
import { FluxCDBuckets } from "./pages/sources/buckets";
import { FluxCDGitRepositories } from "./pages/sources/gitrepositories";
import { FluxCDHelmCharts } from "./pages/sources/helmcharts";
import { FluxCDHelmRepositories } from "./pages/sources/helmrepositories";
import { FluxCDOCIRepositories } from "./pages/sources/ocirepositories";

import { FluxCDHelmReleaseDetails } from "./components/details/helm/helm-release-details";
import { FluxCDImagePolicyDetails } from "./components/details/imageautomation/image-policy-details";
import { FluxCDImageRepositoryDetails } from "./components/details/imageautomation/image-repository-details";
import { FluxCDImageUpdateAutomationDetails } from "./components/details/imageautomation/image-update-automation-details";
import { FluxCDKustomizationDetails } from "./components/details/kustomizations/kustomization-details";
import { FluxCDAlertDetails } from "./components/details/notification/alert-details";
import { FluxCDProviderDetails } from "./components/details/notification/provider-details";
import { FluxCDReceiverDetails } from "./components/details/notification/receiver-details";
import { FluxCDGitRepositoryDetails } from "./components/details/sources/git-repository-details";
import { FluxCDHelmChartDetails } from "./components/details/sources/helm-chart-details";
import { FluxCDHelmRepositoryDetails } from "./components/details/sources/helm-repository-details";

import { Kustomization } from "./k8s/fluxcd/kustomization";
import { Receiver } from "./k8s/fluxcd/notifications/receiver";
import { fluxcdObjects } from "./k8s/fluxcd/objects";

import svgIcon from "./icons/fluxcd.svg?raw";

import { HelmRelease } from "./k8s/fluxcd/helm/helmrelease";
import { ImagePolicy } from "./k8s/fluxcd/image-automation/imagepolicy";
import { ImageRepository } from "./k8s/fluxcd/image-automation/imagerepository";
import { ImageUpdateAutomation } from "./k8s/fluxcd/image-automation/imageupdateautomation";
import { Alert } from "./k8s/fluxcd/notifications/alert";
import { Provider } from "./k8s/fluxcd/notifications/provider";
import { GitRepository } from "./k8s/fluxcd/sources/gitrepository";
import { HelmChart } from "./k8s/fluxcd/sources/helmchart";
import { HelmRepository } from "./k8s/fluxcd/sources/helmrepository";

const {
  Component: { Icon },
} = Renderer;

export function FluxCDIcon(props: Renderer.Component.IconProps) {
  return <Icon {...props} svg={svgIcon} />;
}

export default class FluxCDExtension extends Renderer.LensExtension {
  kubeObjectDetailItems = [
    {
      kind: "Alert",
      apiVersions: [
        "notification.toolkit.fluxcd.io/v1beta1",
        "notification.toolkit.fluxcd.io/v1beta2",
        "notification.toolkit.fluxcd.io/v1beta3",
      ],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Alert>) => <FluxCDAlertDetails {...props} />,
      },
    },
    {
      kind: "GitRepository",
      apiVersions: [
        "source.toolkit.fluxcd.io/v1beta1",
        "source.toolkit.fluxcd.io/v1beta2",
        "source.toolkit.fluxcd.io/v1",
      ],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<GitRepository>) => (
          <FluxCDGitRepositoryDetails {...props} />
        ),
      },
    },
    {
      kind: "HelmChart",
      apiVersions: [
        "source.toolkit.fluxcd.io/v1beta1",
        "source.toolkit.fluxcd.io/v1beta2",
        "source.toolkit.fluxcd.io/v1",
      ],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmChart>) => <FluxCDHelmChartDetails {...props} />,
      },
    },
    {
      kind: "HelmRelease",
      apiVersions: ["helm.toolkit.fluxcd.io/v2beta1", "helm.toolkit.fluxcd.io/v2beta2", "helm.toolkit.fluxcd.io/v2"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmRelease>) => (
          <FluxCDHelmReleaseDetails {...props} />
        ),
      },
    },
    {
      kind: "HelmRepository",
      apiVersions: [
        "source.toolkit.fluxcd.io/v1beta1",
        "source.toolkit.fluxcd.io/v1beta2",
        "source.toolkit.fluxcd.io/v1",
      ],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmRepository>) => (
          <FluxCDHelmRepositoryDetails {...props} />
        ),
      },
    },
    {
      kind: "ImagePolicy",
      apiVersions: ["image.toolkit.fluxcd.io/v1beta1", "image.toolkit.fluxcd.io/v1beta2"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImagePolicy>) => (
          <FluxCDImagePolicyDetails {...props} />
        ),
      },
    },
    {
      kind: "ImageRepository",
      apiVersions: ["image.toolkit.fluxcd.io/v1beta1", "image.toolkit.fluxcd.io/v1beta2"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImageRepository>) => (
          <FluxCDImageRepositoryDetails {...props} />
        ),
      },
    },
    {
      kind: "ImageUpdateAutomation",
      apiVersions: ["image.toolkit.fluxcd.io/v1beta1", "image.toolkit.fluxcd.io/v1beta2"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImageUpdateAutomation>) => (
          <FluxCDImageUpdateAutomationDetails {...props} />
        ),
      },
    },
    {
      kind: "Kustomization",
      apiVersions: [
        "kustomize.toolkit.fluxcd.io/v1beta1",
        "kustomize.toolkit.fluxcd.io/v1beta2",
        "kustomize.toolkit.fluxcd.io/v1",
      ],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Kustomization>) => (
          <FluxCDKustomizationDetails {...props} />
        ),
      },
    },
    {
      kind: "Provider",
      apiVersions: [
        "notification.toolkit.fluxcd.io/v1beta1",
        "notification.toolkit.fluxcd.io/v1beta2",
        "notification.toolkit.fluxcd.io/v1beta3",
      ],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Provider>) => <FluxCDProviderDetails {...props} />,
      },
    },
    {
      kind: "Receiver",
      apiVersions: [
        "notification.toolkit.fluxcd.io/v1beta1",
        "notification.toolkit.fluxcd.io/v1beta2",
        "notification.toolkit.fluxcd.io/v1",
      ],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Receiver>) => <FluxCDReceiverDetails {...props} />,
      },
    },
  ];

  clusterPages = [
    {
      id: "dashboard",
      components: {
        Page: () => <FluxCDDashboard extension={this} />,
      },
    },
    {
      id: "helmreleases",
      components: {
        Page: () => <FluxCDHelmReleases extension={this} />,
      },
    },
    {
      id: "kustomizations",
      components: {
        Page: () => <FluxCDKustomizations extension={this} />,
      },
    },
    {
      id: "gitrepositories",
      components: {
        Page: () => <FluxCDGitRepositories extension={this} />,
      },
    },
    {
      id: "helmrepositories",
      components: {
        Page: () => <FluxCDHelmRepositories extension={this} />,
      },
    },
    {
      id: "helmcharts",
      components: {
        Page: () => <FluxCDHelmCharts extension={this} />,
      },
    },
    {
      id: "ocirepositories",
      components: {
        Page: () => <FluxCDOCIRepositories extension={this} />,
      },
    },
    {
      id: "buckets",
      components: {
        Page: () => <FluxCDBuckets extension={this} />,
      },
    },
    {
      id: "imagepolicies",
      components: {
        Page: () => <FluxCDImagePolicies extension={this} />,
      },
    },
    {
      id: "imageupdateautomations",
      components: {
        Page: () => <FluxCDImageUpdateAutomations extension={this} />,
      },
    },
    {
      id: "imagerepositories",
      components: {
        Page: () => <FluxCDImageRepositories extension={this} />,
      },
    },
    {
      id: "alerts",
      components: {
        Page: () => <FluxCDAlerts extension={this} />,
      },
    },
    {
      id: "providers",
      components: {
        Page: () => <FluxCDProviders extension={this} />,
      },
    },
    {
      id: "receivers",
      components: {
        Page: () => <FluxCDReceivers extension={this} />,
      },
    },
  ];

  clusterPageMenus = [
    {
      id: "fluxcd",
      title: "FluxCD",
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
      id: "kustomizations",
      parentId: "fluxcd",
      target: { pageId: "kustomizations" },
      title: "Kustomizations",
      components: {},
    },
    {
      id: "helm",
      parentId: "fluxcd",
      target: { pageId: "helmreleases" },
      title: "Helm",
      components: {},
    },
    {
      id: "helmreleases",
      parentId: "helm",
      target: { pageId: "helmreleases" },
      title: "Helm Releases",
      components: {},
    },
    {
      id: "sources",
      parentId: "fluxcd",
      target: { pageId: "gitrepositories" },
      title: "Sources",
      components: {},
    },
    {
      id: "gitrepositories",
      parentId: "sources",
      target: { pageId: "gitrepositories" },
      title: "Git Repositories",
      components: {},
    },
    {
      id: "helmrepositories",
      parentId: "sources",
      target: { pageId: "helmrepositories" },
      title: "Helm Repositories",
      components: {},
    },
    {
      id: "helmcharts",
      parentId: "sources",
      target: { pageId: "helmcharts" },
      title: "Helm Charts",
      components: {},
    },
    {
      id: "buckets",
      parentId: "sources",
      target: { pageId: "buckets" },
      title: "Buckets",
      components: {},
    },
    {
      id: "ocirepositories",
      parentId: "sources",
      target: { pageId: "ocirepositories" },
      title: "OCI Repositories",
      components: {},
    },
    {
      id: "imageautomations",
      parentId: "fluxcd",
      target: { pageId: "imagerepositories" },
      title: "Image Automation",
      components: {},
    },
    {
      id: "imagerepositories",
      parentId: "imageautomations",
      target: { pageId: "imagerepositories" },
      title: "Image Repositories",
      components: {},
    },
    {
      id: "imagepolicies",
      parentId: "imageautomations",
      target: { pageId: "imagepolicies" },
      title: "Image Policies",
      components: {},
    },
    {
      id: "imageupdateautomations",
      parentId: "imageautomations",
      target: { pageId: "imageupdateautomations" },
      title: "Image Update Automations",
      components: {},
    },
    {
      id: "notifications",
      parentId: "fluxcd",
      target: { pageId: "alerts" },
      title: "Notifications",
      components: {},
    },
    {
      id: "alerts",
      parentId: "notifications",
      target: { pageId: "alerts" },
      title: "Alerts",
      components: {},
    },
    {
      id: "providers",
      parentId: "notifications",
      target: { pageId: "providers" },
      title: "Providers",
      components: {},
    },
    {
      id: "receivers",
      parentId: "notifications",
      target: { pageId: "receivers" },
      title: "Receivers",
      components: {},
    },
  ];

  kubeObjectMenuItems = fluxcdObjects
    .map((el) => {
      return {
        kind: el.kind,
        apiVersions: el.apiVersions,
        components: {
          MenuItem: (props: FluxcdObjectReconcileMenuItemProps) => (
            <FluxcdObjectReconcileMenuItem {...props} api={el.api} />
          ),
        },
      };
    })
    .concat(
      fluxcdObjects
        .filter((el) => el.suspend !== false)
        .map((el) => {
          return {
            kind: el.kind,
            apiVersions: el.apiVersions,
            components: {
              MenuItem: (props: FluxCdObjectSuspendResumeMenuItemProps) => (
                <FluxcdObjectSuspendResumeMenuItem {...props} api={el.api} />
              ),
            },
          };
        }),
    );
}
