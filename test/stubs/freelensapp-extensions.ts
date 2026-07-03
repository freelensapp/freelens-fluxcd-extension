// Minimal stub for `@freelensapp/extensions`.
//
// The real module is the Freelens host renderer bundle, which expects a browser
// environment and cannot be imported under the Node-based vitest runner. Unit
// tests only exercise pure logic (utility functions and `static` CRD helpers),
// so this stub provides just enough of the `Renderer` surface for the extension
// modules to load: the base classes the CRD models extend and the few host APIs
// referenced by the helpers under test.

class LensExtensionKubeObject {
  metadata: Record<string, unknown> = {};
  spec: Record<string, unknown> = {};
  status: Record<string, unknown> = {};

  constructor(data?: Record<string, unknown>) {
    if (data) Object.assign(this, data);
  }
}

class KubeApi {}
class KubeObjectStore {}

export const Renderer = {
  K8sApi: {
    LensExtensionKubeObject,
    KubeApi,
    KubeObjectStore,
    apiManager: {
      // Returns a deterministic value so tests can assert that a link was built.
      lookupApiLink: (ref: { kind?: string; name?: string }) => `/apis/${ref?.kind ?? "Unknown"}/${ref?.name ?? ""}`,
    },
  },
  Navigation: {
    getDetailsUrl: (url: string) => `/details?url=${encodeURIComponent(url)}`,
  },
};
