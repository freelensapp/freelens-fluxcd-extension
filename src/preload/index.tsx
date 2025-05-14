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
import { FluxCDKustomizations } from "./pages/kustomizations";
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
import { FluxCDKustomizationDetails } from "./components/details/kustomization-details";
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
      } as any,
    },
    {
      kind: "Receiver",
      apiVersions: ["notification.toolkit.fluxcd.io/v1beta1", "notification.toolkit.fluxcd.io/v1beta2"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Receiver>) => <FluxCDReceiverDetails {...props} />,
      } as any,
    },
    {
      kind: "Alert",
      apiVersions: ["notification.toolkit.fluxcd.io/v1beta1", "notification.toolkit.fluxcd.io/v1beta2"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Alert>) => <FluxCDAlertDetails {...props} />,
      } as any,
    },
    {
      kind: "Provider",
      apiVersions: ["notification.toolkit.fluxcd.io/v1beta1", "notification.toolkit.fluxcd.io/v1beta2"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<Provider>) => <FluxCDProviderDetails {...props} />,
      } as any,
    },
    {
      kind: "ImageRepository",
      apiVersions: ["image.toolkit.fluxcd.io/v1beta1", "image.toolkit.fluxcd.io/v1beta2"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImageRepository>) => (
          <FluxCDImageRepositoryDetails {...props} />
        ),
      } as any,
    },
    {
      kind: "ImagePolicy",
      apiVersions: ["image.toolkit.fluxcd.io/v1beta1", "image.toolkit.fluxcd.io/v1beta2"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImagePolicy>) => (
          <FluxCDImagePolicyDetails {...props} />
        ),
      } as any,
    },
    {
      kind: "ImageUpdateAutomation",
      apiVersions: ["image.toolkit.fluxcd.io/v1beta1", "image.toolkit.fluxcd.io/v1beta2"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<ImageUpdateAutomation>) => (
          <FluxCDImageUpdateAutomationDetails {...props} />
        ),
      } as any,
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
      } as any,
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
      } as any,
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
      } as any,
    },
    {
      kind: "HelmRelease",
      apiVersions: ["helm.toolkit.fluxcd.io/v2beta1"],
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<HelmRelease>) => (
          <FluxCDHelmReleaseDetails {...props} />
        ),
      } as any,
    },
  ];

  clusterPages = [
    {
      id: "dashboard",
      components: {
        Page: () => <FluxCDDashboard extension={this as unknown as Renderer.LensExtension} />,
      },
    },
    {
      id: "helmreleases",
      components: {
        Page: () => <FluxCDHelmReleases extension={this as unknown as Renderer.LensExtension} />,
      },
    },
    {
      id: "kustomizations",
      components: {
        Page: () => <FluxCDKustomizations extension={this as unknown as Renderer.LensExtension} />,
      },
    },
    {
      id: "gitrepositories",
      components: {
        Page: () => <FluxCDGitRepositories extension={this as unknown as Renderer.LensExtension} />,
      },
    },
    {
      id: "helmrepositories",
      components: {
        Page: () => <FluxCDHelmRepositories extension={this as unknown as Renderer.LensExtension} />,
      },
    },
    {
      id: "helmcharts",
      components: {
        Page: () => <FluxCDHelmCharts extension={this as unknown as Renderer.LensExtension} />,
      },
    },
    {
      id: "ocirepositories",
      components: {
        Page: () => <FluxCDOCIRepositories extension={this as unknown as Renderer.LensExtension} />,
      },
    },
    {
      id: "buckets",
      components: {
        Page: () => <FluxCDBuckets extension={this as unknown as Renderer.LensExtension} />,
      },
    },
    {
      id: "imagepolicies",
      components: {
        Page: () => <FluxCDImagePolicies extension={this as unknown as Renderer.LensExtension} />,
      },
    },
    {
      id: "imageupdateautomations",
      components: {
        Page: () => <FluxCDImageUpdateAutomations extension={this as unknown as Renderer.LensExtension} />,
      },
    },
    {
      id: "imagerepositories",
      components: {
        Page: () => <FluxCDImageRepositories extension={this as unknown as Renderer.LensExtension} />,
      },
    },
    {
      id: "alerts",
      components: {
        Page: () => <FluxCDAlerts extension={this as unknown as Renderer.LensExtension} />,
      },
    },
    {
      id: "providers",
      components: {
        Page: () => <FluxCDProviders extension={this as unknown as Renderer.LensExtension} />,
      },
    },
    {
      id: "receivers",
      components: {
        Page: () => <FluxCDReceivers extension={this as unknown as Renderer.LensExtension} />,
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
        } as any,
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
            } as any,
          };
        }),
    );
}
