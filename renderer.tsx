import { Renderer } from "@freelensapp/extensions";
import React from "react";

import {
  FluxcdObjectReconcileMenuItem,
  FluxcdObjectReconcileMenuItemProps,
} from "./src/menus/fluxcd-object-reconcile-menu-item";
import {
  FluxCdObjectSuspendResumeMenuItemProps,
  FluxcdObjectSuspendResumeMenuItem,
} from "./src/menus/fluxcd-object-suspend-resume-menu-item";

import { FluxCDDashboard } from "./src/pages/dashboard";
import { FluxCDHelmReleases } from "./src/pages/helm/helmreleases";
import { FluxCDImagePolicies } from "./src/pages/imageautomation/imagepolicies";
import { FluxCDImageRepositories } from "./src/pages/imageautomation/imagerepositories";
import { FluxCDImageUpdateAutomations } from "./src/pages/imageautomation/imageupdateautomations";
import { FluxCDKustomizations } from "./src/pages/kustomizations";
import { FluxCDAlerts } from "./src/pages/notifications/alerts";
import { FluxCDProviders } from "./src/pages/notifications/providers";
import { FluxCDReceivers } from "./src/pages/notifications/receivers";
import { FluxCDBuckets } from "./src/pages/sources/buckets";
import { FluxCDGitRepositories } from "./src/pages/sources/gitrepositories";
import { FluxCDHelmCharts } from "./src/pages/sources/helmcharts";
import { FluxCDHelmRepositories } from "./src/pages/sources/helmrepositories";
import { FluxCDOCIRepositories } from "./src/pages/sources/ocirepositories";

import { FluxCDHelmReleaseDetails } from "./src/components/details/helm/helm-release-details";
import { FluxCDImagePolicyDetails } from "./src/components/details/imageautomation/image-policy-details";
import { FluxCDImageRepositoryDetails } from "./src/components/details/imageautomation/image-repository-details";
import { FluxCDImageUpdateAutomationDetails } from "./src/components/details/imageautomation/image-update-automation-details";
import { FluxCDKustomizationDetails } from "./src/components/details/kustomization-details";
import { FluxCDAlertDetails } from "./src/components/details/notification/alert-details";
import { FluxCDProviderDetails } from "./src/components/details/notification/provider-details";
import { FluxCDReceiverDetails } from "./src/components/details/notification/receiver-details";
import { FluxCDGitRepositoryDetails } from "./src/components/details/sources/git-repository-details";
import { FluxCDHelmChartDetails } from "./src/components/details/sources/helm-chart-details";
import { FluxCDHelmRepositoryDetails } from "./src/components/details/sources/helm-repository-details";

import { Kustomization } from "./src/k8s/fluxcd/kustomization";
import { Receiver } from "./src/k8s/fluxcd/notifications/receiver";
import { fluxcdObjects } from "./src/k8s/fluxcd/objects";

import svgIcon from "./src/icons/fluxcd.svg";
import { HelmRelease } from "./src/k8s/fluxcd/helm/helmrelease";
import { ImagePolicy } from "./src/k8s/fluxcd/image-automation/imagepolicy";
import { ImageRepository } from "./src/k8s/fluxcd/image-automation/imagerepository";
import { ImageUpdateAutomation } from "./src/k8s/fluxcd/image-automation/imageupdateautomation";
import { Alert } from "./src/k8s/fluxcd/notifications/alert";
import { Provider } from "./src/k8s/fluxcd/notifications/provider";
import { GitRepository } from "./src/k8s/fluxcd/sources/gitrepository";
import { HelmChart } from "./src/k8s/fluxcd/sources/helmchart";
import { HelmRepository } from "./src/k8s/fluxcd/sources/helmrepository";

const {
  Component: { Icon },
} = Renderer;

type IconProps = Renderer.Component.IconProps;

export function FluxCDIcon(props: IconProps) {
  return <Icon {...props} svg={svgIcon} />;
}

export default class FluxCDExtension extends Renderer.LensExtension {
  kubeObjectDetailItems = [
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
      kind: "Receiver",
      apiVersions: ["notification.toolkit.fluxcd.io/v1beta1", "notification.toolkit.fluxcd.io/v1beta2"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Receiver>) => <FluxCDReceiverDetails {...props} />,
      },
    },
    {
      kind: "Alert",
      apiVersions: ["notification.toolkit.fluxcd.io/v1beta1", "notification.toolkit.fluxcd.io/v1beta2"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Alert>) => <FluxCDAlertDetails {...props} />,
      },
    },
    {
      kind: "Provider",
      apiVersions: ["notification.toolkit.fluxcd.io/v1beta1", "notification.toolkit.fluxcd.io/v1beta2"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Provider>) => <FluxCDProviderDetails {...props} />,
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
      kind: "HelmRelease",
      apiVersions: ["helm.toolkit.fluxcd.io/v2beta1"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmRelease>) => (
          <FluxCDHelmReleaseDetails {...props} />
        ),
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
      components: {
        Icon: null as any,
      },
    },
    {
      id: "kustomizations",
      parentId: "fluxcd",
      target: { pageId: "kustomizations" },
      title: "Kustomizations",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "helm",
      parentId: "fluxcd",
      title: "Helm",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "helmreleases",
      parentId: "helm",
      target: { pageId: "helmreleases" },
      title: "Helm Releases",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "sources",
      parentId: "fluxcd",
      title: "Sources",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "gitrepositories",
      parentId: "sources",
      target: { pageId: "gitrepositories" },
      title: "Git Repositories",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "helmrepositories",
      parentId: "sources",
      target: { pageId: "helmrepositories" },
      title: "Helm Repositories",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "helmcharts",
      parentId: "sources",
      target: { pageId: "helmcharts" },
      title: "Helm Charts",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "buckets",
      parentId: "sources",
      target: { pageId: "buckets" },
      title: "Buckets",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "ocirepositories",
      parentId: "sources",
      target: { pageId: "ocirepositories" },
      title: "OCI Repositories",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "imageautomations",
      parentId: "fluxcd",
      title: "Image Automation",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "imagerepositories",
      parentId: "imageautomations",
      target: { pageId: "imagerepositories" },
      title: "Image Repositories",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "imagepolicies",
      parentId: "imageautomations",
      target: { pageId: "imagepolicies" },
      title: "Image Policies",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "imageupdateautomations",
      parentId: "imageautomations",
      target: { pageId: "imageupdateautomations" },
      title: "Image Update Automations",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "notifications",
      parentId: "fluxcd",
      title: "Notifications",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "alerts",
      parentId: "notifications",
      target: { pageId: "alerts" },
      title: "Alerts",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "providers",
      parentId: "notifications",
      target: { pageId: "providers" },
      title: "Providers",
      components: {
        Icon: null as any,
      },
    },
    {
      id: "receivers",
      parentId: "notifications",
      target: { pageId: "receivers" },
      title: "Receivers",
      components: {
        Icon: null as any,
      },
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
                <FluxcdObjectSuspendResumeMenuItem api={el.api} {...props} />
              ),
            },
          };
        }),
    );
}
