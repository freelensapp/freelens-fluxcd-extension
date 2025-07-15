import { Common, Renderer } from "@freelensapp/extensions";

import type { FluxCDObject } from "./types";

const { logger } = Common;

export function getApi<Api extends Renderer.K8sApi.KubeApi>(this: FluxCDObject): Api | undefined {
  if (this.kind) {
    for (let apiVersion of this.crd.apiVersions) {
      const api = Renderer.K8sApi.apiManager.getApiByKind(this.kind, apiVersion);
      if (api) return api as Api;
    }
  }
  logger.error(`API for ${this.name} is not registered. Extension won't work correctly`);
  return;
}

export function getStore<Store extends Renderer.K8sApi.KubeObjectStore<any, any, any>>(
  this: FluxCDObject,
): Store | undefined {
  const api = this.getApi();
  if (api) {
    const store = Renderer.K8sApi.apiManager.getStore(api);
    if (store) return store as Store;
  }
  logger.error(`Store for ${this.name} is not registered. Extension won't work correctly`);
  return;
}
