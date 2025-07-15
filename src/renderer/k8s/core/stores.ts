import { Renderer } from "@freelensapp/extensions";

export function getCrdStore() {
  const store = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.crdApi) as Renderer.K8sApi.CRDStore;
  if (store) return store;
  throw new Error("CRD store not found, FluxCD overview may not work correctly.");
}

export function getNamespaceStore() {
  const store = Renderer.K8sApi.apiManager.getStore(Renderer.K8sApi.namespacesApi) as Renderer.K8sApi.NamespaceStore;
  if (store) return store;
  throw new Error("CRD store not found, FluxCD overview may not work correctly.");
}
