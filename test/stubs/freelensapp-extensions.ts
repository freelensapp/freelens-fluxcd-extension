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

  // The host's methods of a KubeObject that the details panels call.
  getName(): string | undefined {
    return (this.metadata as { name?: string } | undefined)?.name;
  }

  // An empty namespace is undefined, as the host's.
  getNs(): string | undefined {
    return (this.metadata as { namespace?: string } | undefined)?.namespace || undefined;
  }

  // The host returns the store it registered for one of the class's
  // `crd.apiVersions`, and throws when there is none. Without a host there is
  // never one; a test that needs a store spies on `getStore` of its class.
  static getStore(): never {
    throw new Error(`Store for ${this.name} is not registered. Extension won't work correctly.`);
  }
}

interface ListItem {
  getName(): string;
}

interface KubeObjectListLayoutProps {
  getItems?: () => ListItem[];
  store?: { items: ListItem[] };
  customizeHeader?: (header: { title: string }) => { title?: unknown; info?: unknown };
  renderTableContents?: (item: ListItem) => React.ReactNode[];
}

// The header is an observer of its own, so `customizeHeader` runs in its
// render, as in the host.
const ListLayoutHeader = observer(({ customizeHeader }: Pick<KubeObjectListLayoutProps, "customizeHeader">) => {
  const { title, info } = customizeHeader?.({ title: "" }) ?? {};

  return React.createElement("div", { "data-testid": "header" }, title as React.ReactNode, info as React.ReactNode);
});

// Only the parts of the host's list layout where it calls back into the
// extension: it reads `getItems()`, or the items of the store without it, in a
// computed value (`item-object-list/list-layout.tsx`) and renders a header that
// calls `customizeHeader`. An item of `getItems()` is rendered by its name; an
// item of the store, as on a cluster page, as the cells of
// `renderTableContents`, each of them a React node.
const KubeObjectListLayout = observer(
  ({ getItems, store, customizeHeader, renderTableContents }: KubeObjectListLayoutProps) => {
    const items = computed(() => (getItems ? getItems() : (store?.items ?? []))).get();
    const renderItem = (item: ListItem) =>
      getItems || !renderTableContents
        ? item.getName()
        : renderTableContents(item).map((cell, index) =>
            React.createElement("div", { key: index, role: "cell" }, cell),
          );

    return React.createElement(
      "div",
      null,
      React.createElement(ListLayoutHeader, { customizeHeader }),
      items.map((item) => React.createElement("div", { key: item.getName(), "data-testid": "item" }, renderItem(item))),
    );
  },
);

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

// The parts of the host's table that hold the content: each renders its
// children only, a row as `role="row"` and a cell as `role="cell"`.
const tablePart =
  (role?: string) =>
  ({ children }: { children?: React.ReactNode }) =>
    React.createElement("div", role ? { role } : null, children);

// The base class of the renderer entry. The host's constructor takes the
// installed extension; a test reads only the registrations of the subclass.
class LensExtension {}

interface StubKubeObjectClass {
  name: string;
  kind?: string;
  crd?: { apiVersions: readonly string[] };
}

// As the host's (`kube-object-registrations.ts`): `kind` and a copy of
// `crd.apiVersions` from the class, and an error without either. The
// `apiVersions` and `visible` options and the fallback to the version of
// `apiBase` are left out.
const registrationOf = (helper: string, kubeObjectClass: StubKubeObjectClass) => {
  const { kind, crd } = kubeObjectClass;
  if (!kind) throw new Error(`${helper}(${kubeObjectClass.name}): the class has no static "kind"`);
  if (!crd?.apiVersions.length) throw new Error(`${helper}(${kubeObjectClass.name}): no "crd.apiVersions"`);
  return { kind, apiVersions: [...crd.apiVersions] };
};

const detailsFor = (
  kubeObjectClass: StubKubeObjectClass,
  { Details, priority }: { Details: unknown; priority?: number },
) => ({
  ...registrationOf("detailsFor", kubeObjectClass),
  components: { Details },
  ...(priority === undefined ? {} : { priority }),
});

const menuItemFor = (kubeObjectClass: StubKubeObjectClass, { MenuItem }: { MenuItem: unknown }) => ({
  ...registrationOf("menuItemFor", kubeObjectClass),
  components: { MenuItem },
});

export const Renderer = {
  LensExtension,
  Component: {
    // The host's badge shows its label with its class.
    Badge: ({ label, className }: { label?: React.ReactNode; className?: string }) =>
      React.createElement("span", { className }, label),
    // The host's badge reads True or False.
    BadgeBoolean: ({ value }: { value: boolean }) =>
      React.createElement(React.Fragment, null, value ? "True" : "False"),
    DrawerItem,
    DrawerItemLabels,
    DrawerTitle: ({ children }: { children?: React.ReactNode }) => React.createElement("div", null, children),
    DurationAbsoluteTimestamp: ({ timestamp }: { timestamp?: string }) =>
      React.createElement(React.Fragment, null, timestamp),
    // The host draws a font or SVG icon; a test reads the text next to it.
    Icon: () => null,
    // The host shows the age of the object, which changes with the time.
    KubeObjectAge: () => null,
    KubeObjectListLayout,
    // The host links the name to the details of the namespace, Secret or ServiceAccount.
    LinkToNamespace: ({ namespace }: { namespace?: string }) => React.createElement(React.Fragment, null, namespace),
    // The host links the reference to its details; a test reads the name.
    LinkToObject: ({ objectRef }: { objectRef?: { name?: string } }) =>
      React.createElement(React.Fragment, null, objectRef?.name),
    LinkToSecret: ({ name }: { name?: string }) => React.createElement(React.Fragment, null, name),
    LinkToServiceAccount: ({ name }: { name?: string }) => React.createElement(React.Fragment, null, name),
    // A link where `to` is set, and its text only otherwise, as in the host.
    MaybeLink: ({ to, children }: { to?: string; children?: React.ReactNode }) =>
      to ? React.createElement("a", { href: to }, children) : React.createElement(React.Fragment, null, children),
    // An item of a menu, which calls `onClick` when clicked and not when disabled, as in the host.
    MenuItem: ({
      onClick,
      disabled,
      children,
    }: {
      onClick?: () => void;
      disabled?: boolean;
      children?: React.ReactNode;
    }) =>
      React.createElement(
        "li",
        { role: "menuitem", "aria-disabled": disabled, onClick: disabled ? undefined : onClick },
        children,
      ),
    // The host shows the value in a read-only Monaco editor.
    MonacoEditor: ({ value }: { value?: string }) => React.createElement("pre", null, value),
    // The host links the namespace to its selection.
    NamespaceSelectBadge: ({ namespace }: { namespace?: string }) =>
      React.createElement(React.Fragment, null, namespace),
    // The host draws the chart with Chart.js; a test checks what is around it.
    PieChart: () => null,
    // The host shows the time since the timestamp, which changes with the time.
    ReactiveDuration: () => null,
    Table: tablePart(),
    TableCell: tablePart("cell"),
    TableHead: tablePart(),
    TableRow: tablePart("row"),
    // The host adds a tooltip to its children.
    WithTooltip: ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children),
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
    detailsFor,
    menuItemFor,
  },
  Navigation: {
    getDetailsUrl: (url: string) => `/details?url=${encodeURIComponent(url)}`,
  },
  Util: {
    // A key that is the same for equal data; the host's is a hash of the same
    // JSON.
    createReactKey: (data: unknown) => JSON.stringify(data),
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
