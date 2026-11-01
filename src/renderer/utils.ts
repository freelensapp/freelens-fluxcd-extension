import { Renderer } from "@freelensapp/extensions";

import type { DumpOptions } from "js-yaml";

const {
  Navigation: { getDetailsUrl },
} = Renderer;

export function getMaybeDetailsUrl(url?: string): string {
  if (url) {
    return getDetailsUrl(url);
  } else {
    return "";
  }
}

/**
 * Returns the store of the first class whose API version the cluster serves, or `undefined` when it serves none.
 *
 * The host registers an API for every served version of a CRD, so the classes of one kind, ordered newest first, must
 * not each be used: the objects would be counted once per served version. `getStore()` throws for a version the
 * cluster does not serve. It reads the host's observable API registry, so an `observer` that calls this renders again
 * when a version becomes served.
 */
export function getServedStore(kubeObjectClasses: (typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>)[]) {
  for (const kubeObjectClass of kubeObjectClasses) {
    try {
      return kubeObjectClass.getStore();
    } catch {
      // not served, try the next version
    }
  }
  return undefined;
}

/**
 * Tells whether the request of a `KubeApi` failed because the object does not exist. The host rejects with a
 * `JsonApiErrorParsed` whose (TypeScript-private) `error` is the `Status` that the API server returned, with `code`
 * 404 for an object that is not there.
 */
function isNotFoundError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("error" in error)) return false;
  const status = error.error;
  return typeof status === "object" && status !== null && "code" in status && status.code === 404;
}

interface DataSourceApi {
  get(descriptor: { name: string; namespace?: string }): Promise<{ data?: Partial<Record<string, string>> } | null>;
}

/**
 * Returns the `data` of a ConfigMap or Secret that a Flux object takes values or variables from, or `undefined` when it
 * cannot be read, so that the caller goes on with the next source. A missing source is a valid state (`optional: true`,
 * or not created yet), so its 404 is not reported; any other error is logged as a warning. The 404 of a source that
 * does not exist is still logged by Chromium as a failed request.
 */
export async function getSourceData(
  api: DataSourceApi,
  name: string,
  namespace?: string,
): Promise<Partial<Record<string, string>> | undefined> {
  try {
    return (await api.get({ name, namespace }))?.data;
  } catch (error) {
    if (!isNotFoundError(error)) {
      console.warn(`[@freelensapp/fluxcd-extension]: cannot read ${namespace}/${name}: ${String(error)}`);
    }
    return undefined;
  }
}

export function getHeight(data?: string): number {
  const lineHeight = 18;
  if (!data) return lineHeight;

  const lines = data.split("\n").length;
  if (lines < 5) return 5 * lineHeight;
  if (lines > 20) return 20 * lineHeight;
  return lines * lineHeight;
}

export const defaultYamlDumpOptions: DumpOptions = {
  seqNoIndent: true,
  noRefs: true,
  quoteStyle: "double",
  sortKeys: true,
};

export function createEnumFromKeys<T extends Record<string, any>>(obj: T): Record<keyof T, keyof T> {
  return Object.keys(obj).reduce(
    (acc, key) => {
      acc[key as keyof T] = key as keyof T;
      return acc;
    },
    {} as Record<keyof T, keyof T>,
  );
}
