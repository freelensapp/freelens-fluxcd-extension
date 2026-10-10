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
import { computed } from "mobx";
import { observer } from "mobx-react";
import React from "react";
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

interface KubeObjectListLayoutProps {
  getItems: () => { getName(): string }[];
  customizeHeader?: (header: { title: string }) => { title?: unknown; info?: unknown };
}

// The header is an observer of its own, so `customizeHeader` runs in its
// render, as in the host.
const ListLayoutHeader = observer(({ customizeHeader }: Pick<KubeObjectListLayoutProps, "customizeHeader">) => {
  const { title, info } = customizeHeader?.({ title: "" }) ?? {};

  return React.createElement("div", { "data-testid": "header" }, title as React.ReactNode, info as React.ReactNode);
});

// Only the parts of the host's list layout where it calls back into the
// extension: it reads `getItems()` in a computed value
// (`item-object-list/list-layout.tsx`) and renders a header that calls
// `customizeHeader`. Each item is rendered by its name.
const KubeObjectListLayout = observer(({ getItems, customizeHeader }: KubeObjectListLayoutProps) => {
  const items = computed(() => getItems()).get();

  return React.createElement(
    "div",
    null,
    React.createElement(ListLayoutHeader, { customizeHeader }),
    items.map((item) => React.createElement("div", { key: item.getName(), "data-testid": "item" }, item.getName())),
  );
});

export const Renderer = {
  Component: {
    KubeObjectListLayout,
    // The host draws the chart with Chart.js; a test checks what is around it.
    PieChart: () => null,
  },
  K8sApi: {
    LensExtensionKubeObject,
    KubeApi: class KubeApi {},
    KubeObjectStore: class KubeObjectStore {},
    // Without a host there are no events; a test that needs some spies on
    // `contextItems`.
    eventStore: {
      get contextItems(): unknown[] {
        return [];
      },
      limit: 1000,
    },
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
  Util: {
    cssNames: (...names: unknown[]) =>
      names
        .flatMap((name) =>
          name && typeof name === "object"
            ? Object.entries(name)
                .filter(([, enabled]) => enabled)
                .map(([key]) => key)
            : [name],
        )
        .filter(Boolean)
        .join(" "),
    stopPropagation: (event: Event) => event.stopPropagation(),
  },
};
