import { Renderer } from "@freelensapp/extensions";

import type { NamespacedObjectKindReference } from "./types";

type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;

/**
 * The API group of each Flux kind, so that a reference to a Flux kind resolves within its group only, even when
 * another group has a kind of the same name (such as a `Bucket` or a `Provider` of another operator).
 */
const fluxApiGroups: Partial<Record<string, string>> = {
  Bucket: "source.toolkit.fluxcd.io",
  ExternalArtifact: "source.toolkit.fluxcd.io",
  GitRepository: "source.toolkit.fluxcd.io",
  HelmChart: "source.toolkit.fluxcd.io",
  HelmRepository: "source.toolkit.fluxcd.io",
  OCIRepository: "source.toolkit.fluxcd.io",
  Kustomization: "kustomize.toolkit.fluxcd.io",
  HelmRelease: "helm.toolkit.fluxcd.io",
  ImagePolicy: "image.toolkit.fluxcd.io",
  ImageRepository: "image.toolkit.fluxcd.io",
  ImageUpdateAutomation: "image.toolkit.fluxcd.io",
  Alert: "notification.toolkit.fluxcd.io",
  Provider: "notification.toolkit.fluxcd.io",
  Receiver: "notification.toolkit.fluxcd.io",
  FluxInstance: "fluxcd.controlplane.io",
  FluxReport: "fluxcd.controlplane.io",
  ResourceSet: "fluxcd.controlplane.io",
  ResourceSetInputProvider: "fluxcd.controlplane.io",
};

const stagePriority: Partial<Record<string, number>> = { alpha: 0, beta: 1, "": 2 };

/**
 * Compares two API versions in the order Kubernetes gives them priority: GA before beta before alpha, and a higher
 * version first within the same stage (`v2`, `v1`, `v1beta2`, `v1beta1`, `v1alpha1`). A version that does not look
 * like a Kubernetes version comes last.
 */
export function compareApiVersions(a: string, b: string): number {
  const parse = (version: string) => {
    const match = /^v(\d+)(?:(alpha|beta)(\d+))?$/.exec(version);
    if (!match) return;
    return { major: Number(match[1]), stage: stagePriority[match[2] ?? ""] ?? 0, minor: Number(match[3] ?? 0) };
  };
  const left = parse(a);
  const right = parse(b);
  if (!left || !right) {
    if (left) return -1;
    if (right) return 1;
    return a.localeCompare(b);
  }
  return right.stage - left.stage || right.major - left.major || right.minor - left.minor;
}

/**
 * Returns the `apiVersion` (with the group) of the newest version of `kind` the cluster serves, or `undefined` when
 * the host has no API for the kind. A Flux kind is looked up in its own API group only.
 *
 * It reads the host's observable API registry, so an `observer` that calls this renders again when an API is
 * registered.
 */
export function getServedApiVersion(kind: string): string | undefined {
  const group = fluxApiGroups[kind];
  const versions: { apiVersion: string; apiVersionWithGroup: string }[] = [];

  // The host has no call that lists its APIs: a callback that never matches visits them all.
  Renderer.K8sApi.apiManager.getApi((api) => {
    if (api.kind === kind && (group === undefined || api.apiGroup === group)) {
      versions.push({ apiVersion: api.apiVersion, apiVersionWithGroup: api.apiVersionWithGroup });
    }
    return false;
  });

  versions.sort((a, b) => compareApiVersions(a.apiVersion, b.apiVersion));
  return versions[0]?.apiVersionWithGroup;
}

/**
 * Returns the reference with the `apiVersion` the cluster serves for its kind, when it has a `kind` and no
 * `apiVersion`, and the reference unchanged otherwise.
 *
 * Flux references, such as `spec.sourceRef`, usually leave out `apiVersion`. The host's `lookupApiLink` then assumes
 * `v1`, the core group, and builds a link to an object that does not exist.
 */
export function withServedApiVersion<Ref extends LocalObjectReference | NamespacedObjectKindReference | undefined>(
  ref: Ref,
): Ref {
  if (!ref || !("kind" in ref) || !ref.kind || ref.apiVersion) return ref;
  const apiVersion = getServedApiVersion(ref.kind);
  if (!apiVersion) return ref;
  return { ...ref, apiVersion };
}

export function getRefUrl(
  ref: LocalObjectReference | NamespacedObjectKindReference,
  parentObject?: Renderer.K8sApi.KubeObject,
) {
  if (!ref) return;
  return Renderer.K8sApi.apiManager.lookupApiLink(withServedApiVersion(ref), parentObject);
}
