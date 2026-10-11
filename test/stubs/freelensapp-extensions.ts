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

interface StubKubeApi {
  kind: string;
  apiVersionWithGroup: string;
  formatUrlForNotListing(descriptor: { name?: string; namespace?: string }): string;
}

interface StubObjectReference {
  apiVersion?: string;
  kind?: string;
  name: string;
  namespace?: string;
}

const apiManager = {
  // The host's registry has an API for every resource the cluster serves.
  // Without a host it has none; a test that needs some spies on `getApi`.
  getApi: (_callback: (api: StubKubeApi) => boolean): StubKubeApi | undefined => undefined,

  // As the host's (`api-manager.ts`): `apiVersion` defaults to `v1` and the
  // namespace to the parent's; the link comes from the API of the kind and
  // version, or, without one, is built under `/apis` from the defaulted
  // `apiVersion`. The host's lookup of an API by the built path is left out.
  lookupApiLink(ref: StubObjectReference, parentObject?: { metadata?: { namespace?: string } }): string {
    const { kind, apiVersion = "v1", name, namespace = parentObject?.metadata?.namespace } = ref;
    if (!kind) return "";
    const api = apiManager.getApi((api) => api.kind === kind && api.apiVersionWithGroup === apiVersion);
    if (api) return api.formatUrlForNotListing({ name, namespace });
    const resource = kind.toLowerCase().replace(/y$/, "ie").replace(/s$/, "se") + "s";
    return `/apis/${apiVersion}${namespace ? `/namespaces/${namespace}` : ""}/${resource}/${name}`;
  },
};

interface DrawerItemProps {
  name?: React.ReactNode;
  hidden?: boolean;
  children?: React.ReactNode;
}

// The drawer items of a details view, each rendered as its name and value,
// and not at all when `hidden`, as in the host.
const DrawerItem = ({ name, hidden, children }: DrawerItemProps) =>
  hidden ? null : React.createElement("div", { "data-testid": "drawer-item" }, name, ": ", children);

// As the host's: `key=value` per label, and nothing without labels.
const DrawerItemLabels = ({ labels, ...props }: DrawerItemProps & { labels: string[] | Record<string, string> }) => {
  const items = Array.isArray(labels) ? labels : Object.entries(labels).map(([key, value]) => `${key}=${value}`);
  if (!items.length) return null;
  return DrawerItem({ ...props, children: items.join(", ") });
};

// The base class of the renderer entry. The host's constructor takes the
// installed extension; a test reads only the registrations of the subclass.
class LensExtension {}

export const Renderer = {
  LensExtension,
  Component: {
    DrawerItem,
    DrawerItemLabels,
    DrawerTitle: ({ children }: { children?: React.ReactNode }) => React.createElement("div", null, children),
    DurationAbsoluteTimestamp: ({ timestamp }: { timestamp?: string }) =>
      React.createElement(React.Fragment, null, timestamp),
    KubeObjectListLayout,
    // A link where `to` is set, and its text only otherwise, as in the host.
    MaybeLink: ({ to, children }: { to?: string; children?: React.ReactNode }) =>
      to ? React.createElement("a", { href: to }, children) : React.createElement(React.Fragment, null, children),
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
    apiManager,
  },
  Navigation: {
    getDetailsUrl: (url: string) => `/details?url=${encodeURIComponent(url)}`,
  },
  Util: {
    // A date, or a date and time with an optional offset, that the host
    // accepts as ISO 8601 and that parses to a valid time.
    isIso8601DateString: (value: string) =>
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(value) &&
      !Number.isNaN(Date.parse(value)),
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
