// Minimal stub of `@freelensapp/extensions` for unit tests.
//
// The published package is a shim that reads `Common`, `Main` and `Renderer`
// off `globalThis.FreelensExtensionApi`, which the Freelens host sets before it
// loads an extension. A Vitest process has no host, so importing the real
// package throws. `vitest.config.ts` aliases the import to this file instead.
// The package ships no mocks of its own to use in its place.
//
// Only the surface the tests exercise is stubbed here, and only at runtime: the
// tests are type-checked against the real declaration of the package. Extend it
// as the tests need more of the host API.
import { createHash } from "node:crypto";
import { vi } from "vitest";

class LensExtensionKubeObject {
  apiVersion?: string;
  kind?: string;
  metadata?: unknown;
  spec?: unknown;
  status?: unknown;

  constructor(data: Record<string, unknown> = {}) {
    Object.assign(this, data);
  }

  // The host returns the store it registered for one of the class's
  // `crd.apiVersions`, and throws when there is none. Without a host there is
  // never one; a test that needs a store spies on `getStore` of its class.
  static getStore(): never {
    throw new Error(`Store for ${this.name} is not registered. Extension won't work correctly.`);
  }
}

export const Renderer = {
  Component: {
    // The host draws the chart with Chart.js; a test checks what is around it.
    PieChart: () => null,
  },
  K8sApi: {
    LensExtensionKubeObject,
    KubeApi: class KubeApi {},
    KubeObjectStore: class KubeObjectStore {},
    apiManager: {
      // Returns a deterministic value so tests can assert that a link was built.
      lookupApiLink: (ref: { kind?: string; name?: string }) => `/apis/${ref?.kind ?? "Unknown"}/${ref?.name ?? ""}`,
    },
  },
  Navigation: {
    getDetailsUrl: (url: string) => `/details?url=${encodeURIComponent(url)}`,
  },
  Util: {
    // The host computes the same digest: SHA-256 of the UTF-8 bytes, as
    // lowercase hex.
    sha256Hex: (data: string | Uint8Array) => createHash("sha256").update(data).digest("hex"),
  },
};

export const Common = {
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
};
