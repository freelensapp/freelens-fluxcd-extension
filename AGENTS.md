# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

> **Tip**: If you find yourself correcting the agent during interactive work, suggest adding a new rule to this file so the lesson is captured for future sessions.

## Project Overview

This repository integrates FluxCD support into the Freelens application. It
provides dashboards, detail views, cluster pages, and resource menus (reconcile,
suspend, resume) for FluxCD v2 custom resources.

- **Language**: TypeScript 7.0.2
- **Runtime**: Freelens >= 2.0.0 (extension API v2)
- **Toolchain**: Node.js 24.21.0, yq 4.54.1 and cosign 3.1.3 (`mise.toml` with
  `mise.lock`; Node also in `.nvmrc`)
- **Package manager**: pnpm 12.9.1 (`packageManager`, run through corepack)
- **License**: MIT

Library and tool versions follow the Freelens stack exactly: the catalog in
Freelens's `pnpm-workspace.yaml` for libraries, the root `package.json` scripts
of Freelens for tools run with `pnpm dlx` (Biome, knip, Trunk launcher), and
Freelens's `mise.toml` and `.nvmrc` for Node and the other mise tools.
Renovate keeps them there: custom datasources in `.renovaterc.json` read the
versions from the same Freelens files on `main`, so an update arrives only once
Freelens has adopted it, at that version, in one `Freelens` group PR together
with the `@freelensapp/extensions` nightly. A dependency added to
`package.json` follows the Freelens catalog unless the catalog rule excludes
it; one that Freelens does not have (`js-base64`, `moment`) must be excluded
there, or its lookup fails on the Dependency Dashboard. What Freelens does not
define (GitHub Actions, the tool versions in the workflows, `shx`) Renovate
updates as usual. pnpm is the exception: Renovate updates it from the npm
registry, in a pull request of its own, and not to the version of Freelens's
`packageManager`.
`packageManager` carries a Corepack hash (`+sha512.…`), and Renovate updates
the hash only from the digest of the new version, which the registry has and a
custom datasource does not; without it the update fails with "no valid digest
available". `@freelensapp/extensions` is pinned to one exact version. The libraries the
host provides at runtime (`react`, `react-dom`, `mobx`, `mobx-react`) and their
types are devDependencies only, for compiling and testing; `electron` is a
devDependency for its types only. The libraries the extension bundles
(`js-yaml`, `js-base64`, `moment`) are devDependencies too: the host installs
no dependencies of an extension, so they reach it only inside the bundle.
`mise.lock` pins a checksum and a URL per tool for every platform; after
changing `mise.toml`, run `mise lock`, not only `mise install`.

pnpm settings live in `pnpm-workspace.yaml`. A dependency runs its install
scripts only when `allowBuilds` sets it to `true`; a new dependency with
install scripts that is not listed there fails `pnpm install`, so add it with
`true` or `false` deliberately. pnpm refuses versions younger than its
`minimumReleaseAge` (1 day), with `@freelensapp/extensions` excluded because
its pinned nightly is often adopted on the day it is published.

`strictPeerDependencies: true` makes `pnpm install` fail when the extension's
own copy of a shared library is outside the peer range that
`@freelensapp/extensions` declares for it: `react`, `react-dom`,
`@types/react`, `@types/react-dom`, `mobx`, `mobx-react`, `monaco-editor` and
`electron`. These peers are optional, so they are checked only when the
extension declares the library, which it does for every one it imports or
compiles against. Without the setting pnpm reports a mismatch as one warning
line and installs anyway. The types are peers as well, so the package's
declaration compiles against the extension's own `@types/react` and
`@types/react-dom`, one copy of each.

## Common Commands

```bash
# Type checking
pnpm type:check                # All of the programs below, in this order
pnpm type:check:sources        # main and renderer, each with src/common/
pnpm type:check:tests          # Tests and test support
pnpm type:check:tooling        # Vite and Vitest configs, build plugins
pnpm type:check:environments   # Environment tests

# Linting & formatting
pnpm biome:check          # TypeScript/TSX, JS, JSON, CSS, HTML (biome)
pnpm biome:fix            # Auto-fix the formats above
pnpm prettier:check       # SCSS and other formats not covered by biome
pnpm prettier:fix         # Auto-fix SCSS, etc.
pnpm trunk:check          # Markdown, YAML, TOML, SCSS, workflows, and Biome again (changed files)
pnpm trunk:fix            # Auto-fix via trunk
pnpm lint:check           # Runs biome:check and prettier:check
pnpm lint:fix             # Runs biome:fix and prettier:fix

# Dead-code / dependency checks
pnpm knip:check           # Unused files, unused and unlisted dependencies (knip)

# Tests
pnpm test:unit            # vitest

# Build
pnpm build                # Both Vite runs, without the type check
pnpm dev                  # Both Vite runs in watch mode, for a directory install

# Pack for testing
pnpm pack:dev             # Bump prerelease version, build, and create .tgz for install in Freelens app

# Clean
pnpm clean                # Clean dist/
pnpm clean:dts            # Remove generated *.d.scss.ts files
pnpm clean:all            # Clean everything (dist, dts, node_modules, tgz)
```

Unit tests (`*.test.ts(x)` next to the code) run with Vitest; see "Tests and
tooling". End-to-end behavior is exercised by the integration tests in
`.github/workflows/integration-tests.yaml`.

## Architecture

```text
src/
  main/index.ts                        # Main entry (Main.LensExtension), ESM
  renderer/index.tsx                   # Renderer entry (Renderer.LensExtension): every registration, ESM
  renderer/k8s/fluxcd/                 # K8s object model classes, grouped by controller
                                       #   (source, kustomize, helm, image, notification, controlplane)
  renderer/k8s/fluxcd/utils.ts         # Links of Flux references (served API version)
  renderer/k8s/core/                   # Core K8s object models
  renderer/components/details/         # Detail view components, grouped by controller
  renderer/pages/                      # Cluster page components, grouped by controller
  renderer/pages/available-version.tsx # Page that picks the first served API version of a kind
  renderer/pages/overview.tsx          # Overview page (pie chart per kind, FluxCD events)
  renderer/menus/                      # Resource menu items (reconcile, suspend, resume)
  renderer/components/                 # Shared components (status, charts, YAML dump, etc.)
  renderer/icons/                      # SVG icons
  renderer/utils.ts                    # Utility functions (getServedStore, getMaybeDetailsUrl, ...)
  common/                              # Code for both processes (none yet; its tsconfig.json only)
test/stubs/                            # Runtime stub of @freelensapp/extensions for Vitest
integration/__tests__/                 # Integration tests, run inside a Freelens checkout
environment-tests/                     # Probes for the per-environment programs
build/                                 # Vite plugins: host modules, standard decorators, CSS module declarations
```

Build output goes to `dist/`: `main.js`, `renderer.js` and `renderer.css`, with
source maps. `main` and `renderer` in `package.json` point at the two entries.

FluxCD CRDs are versioned. Each resource has one file per API version (e.g.
`gitrepository-v1.ts`, `gitrepository-v1beta2.ts`) under the matching controller
directory in `src/renderer/k8s/fluxcd/`.

## CRD KubeObject Pattern

K8s object classes MUST use `static readonly` properties for metadata. **Instance methods do NOT work and MUST NOT be used.** The Freelens host reads properties from the class constructor statically — instance methods are not available at runtime because the host creates plain object copies of the K8s resource data, not instances of the extension's class. This means:

- **Allowed**: `object.spec?.someField`, `object.status?.conditions` — direct property access on typed `spec`/`status` interfaces
- **Allowed**: `static` helper methods that take the object as an argument (e.g. `GitRepository.getGitRef(object.spec?.ref)`)
- **Forbidden**: `object.someMethod()` — instance methods will never exist at runtime
- **Forbidden**: `typeof (object as any).someMethod === "function" ? ...` — anti-pattern that always falls through to the fallback path
- **Forbidden**: `as any` — use the existing typed `spec`/`status` interfaces directly; all CRD models already define proper `Spec`/`Status` interfaces

Always access `spec` and `status` properties directly via their typed interfaces. Do not define instance methods on KubeObject subclasses — they will not be callable at runtime.

```typescript
export class GitRepository extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  GitRepositoryStatus,
  GitRepositorySpec
> {
  static readonly kind = "GitRepository";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/source.toolkit.fluxcd.io/v1/gitrepositories";

  static readonly crd = {
    apiVersions: ["source.toolkit.fluxcd.io/v1"],
    plural: "gitrepositories",
    singular: "gitrepository",
    shortNames: ["gitrepo"],
    title: "Git Repositories",
  };

  // Static helpers are allowed and take the object (or a field) as an argument:
  static getGitRevision(object: GitRepository): string | undefined {
    return object.status?.artifact?.revision?.replace(/^refs\/(heads|tags)\//, "");
  }
}

// Also export Api and Store classes (always needed):
export class GitRepositoryApi extends Renderer.K8sApi.KubeApi<GitRepository> {}
export class GitRepositoryStore extends Renderer.K8sApi.KubeObjectStore<GitRepository> {}
```

Each CRD file exports three classes: the KubeObject, the KubeApi, and the KubeObjectStore. They are registered in `src/renderer/index.tsx` via `kubeObjectDetailItems`, `clusterPages`, `clusterPageMenus`, and `kubeObjectMenuItems`.

Shared Kubernetes types (`Condition`, `LocalObjectReference`, `LabelSelector`) come from `Renderer.K8sApi`, usually
through a local alias after the imports (`type LocalObjectReference = Renderer.K8sApi.LocalObjectReference;`).

## Renderer Components

- Detail views and pages are grouped by FluxCD controller (source, kustomize, helm, image, notification, controlplane).
- Shared spec/status widgets live in `src/renderer/components/` (e.g. `status-history`, `status-inventory`, `status-artifact`, `pie-chart`, `yaml-dump`).
- Pages, details and shared components import their CSS module for the class names only, with no `?inline` import and
  no `<style>` tag; the rules reach the page through `renderer.css`.
- Layout comes from the component's own CSS module. The host has no flexbox utility classes (`flex`, `column`, `box`,
  `grow`, ...): such a class name does nothing, so write the rule instead (`display: flex; flex-direction: column`).
- React keys for list items without a natural key come from `Renderer.Util.createReactKey(item)`.
- Renderer code has no Node: no `crypto`, `node:*` or other builtins. Use `Renderer.Util.sha256Hex` for SHA-256.
- Links inside components use `Renderer.Component.MaybeLink` (`to`, `onClick`); there is no `react-router-dom`.
- A Flux reference with a `kind` usually has no `apiVersion` (`spec.sourceRef`, `spec.chartRef`, `eventSources`,
  health checks), and the host's `lookupApiLink` then assumes `v1`, the core group. Such a reference goes through
  `getRefUrl` or, for `Renderer.Component.LinkToObject`, `withServedApiVersion` (`src/renderer/k8s/fluxcd/utils.ts`),
  which fill in the newest version the cluster serves for the kind, within its group for a Flux kind.
- A component opens a page of the extension with `extension.navigate(pageId)`, the page ids being the `id`s of the
  `clusterPages` registrations (the singular name of the kind, `dashboard` for the Overview). `Renderer.Navigation.navigate`
  takes an absolute pathname, such as the result of `Renderer.Navigation.getDetailsUrl`; the host logs a warning for a
  relative one.
- The host registers an API for every served version of a CRD, so every class of a kind whose version is served has a
  store. Code that covers all kinds, such as the Overview page, takes one class per kind, the first served one of its
  classes ordered newest first (`getServedStore` in `src/renderer/utils.ts`); using each class would load and count the
  same objects once per served version.
- The host renders a cluster page with `params` only. A page that needs the extension gets it from its registration
  (`Page: () => <AlertsPage extension={this} />`), with the page created once at module level by
  `createAvailableVersionPage` in `src/renderer/pages/available-version.tsx`. The page it returns is an `observer`:
  `getStore()` reads the host's observable API registry, and the host registers a CRD's APIs only after the cluster
  frame has loaded the CRDs, so the page renders again when the version becomes available.
- A `kubeObjectMenuItems` `MenuItem` gets `object` and `toolbar` (`Common.Types.KubeObjectMenuItemProps<Kind>`); the
  registration passes `resource`:
  `MenuItem: (props: Common.Types.KubeObjectMenuItemProps<Alert_v1beta3>) => <FluxCDObjectReconcileMenuItem {...props} resource={Alert_v1beta3} />`.
- SCSS modules get TypeScript declarations (`*.module.d.scss.ts`), written during the renderer build (see
  "CSS module declarations"). They are committed, because `pnpm type:check` runs without a build; commit the
  regenerated file with a change to its SCSS module. `pnpm clean:dts` removes them.

## Rules That Fail Silently

Each of these compiles when it is broken, and breaks the extension at runtime
or not visibly at all. The sections named in parentheses explain the
mechanism; this is the list to check a change against.

- **The host's React and mobx, one copy each.** Import `react`, `react-dom`,
  `mobx` and `mobx-react` by their bare module ids. A second React throws
  `invalid hook call`; a second mobx throws nothing, and the host never reacts
  to its observables. The build fails on the ways a second copy gets in
  ("Modules provided by the host").
- **Standard decorators.** An observable field is `@observable accessor`, and
  the class does not call `makeObservable(this)`. Without `accessor` the
  production build of mobx leaves the field unobservable ("Decorators").
- **`this.props` of an `@observer` class component in its own `render()`
  only.** A read in a `@computed` getter, or in a callback the host calls from
  its own derivation, throws at runtime and crashes the page; only a jsdom
  test shows it ("Decorators").
- **No Node or Electron in renderer and common code.** They are `undefined` in
  the renderer. The build fails on an import, `pnpm type:check` on a global
  ("Process-specific settings").
- **One CSS asset, `dist/renderer.css`.** Any other name, or a second asset,
  leaves the extension unstyled. Nothing checks it; look at `dist/` after a
  change to the CSS setup ("CSS").
- **No flexbox utility classes.** The host has none, so `flex`, `column`,
  `box` or `grow` in a `className` does nothing and the element loses its
  layout ("Renderer Components").
- **One tsconfig per environment.** Each program has only its runtime's `lib`
  and `types`, and no declaration may load Node into the renderer or the DOM
  into main; otherwise a wrong API type-checks and is `undefined` at runtime.
  The environment tests fail on a leak ("TypeScript").
- **No instance method on a KubeObject subclass.** The objects from the host
  do not have it, and the call throws. Nothing checks it
  ("CRD KubeObject Pattern").
- **A component that chooses the version through `getStore()` is an
  `observer`.** The host registers a CRD's APIs after the cluster frame has
  loaded the CRDs; a component that is not an `observer` and rendered before
  then shows the kind as not installed until the user navigates away and back
  ("Renderer Components").
- **One class per kind where code covers all kinds.** Every served version
  resolves, so walking all the classes of a kind loads and counts the same
  objects once per version (`getServedStore`, "Renderer Components").
- **A cluster page gets the extension from its registration.** The host passes
  `params` only. The type check rejects a page that requires another prop, but
  not one that declares it optional ("Renderer Components").
- **A Flux reference without `apiVersion` goes through `getRefUrl` or
  `withServedApiVersion`.** Passed to the host as it is, it links to the core
  group, and the details drawer opens nothing ("Renderer Components").
- **An ESM `main`, and the entries in `package.json` unchanged while
  `pnpm dev` runs.** The host refuses to reload a CommonJS main and logs why,
  and it watches only the entries it started with, so a manifest change needs
  Freelens restarted.

Neither `pnpm build` nor `pnpm dev` runs the type check, so a Node global in
renderer code passes them; `pnpm type:check` and `type-check.yaml` catch it.

## Build

`vite.config.mjs` builds one entry point per run, in library mode, as ESM:
`vite build` builds the renderer and empties `dist/`, and `vite build --mode
main` builds main next to it. The two runs share no chunk. Nothing is
minified. Neither `pnpm build` nor `pnpm dev` runs the type check; run
`pnpm type:check` separately.

`pnpm dev` runs the same two builds in watch mode, side by side, for a
directory install: the host reloads the extension when either entry is
rewritten. Its renderer run passes `--no-emptyOutDir`. In watch mode Vite
empties the output directory again before every rebuild, so a renderer rebuild
would delete `dist/main.js`, and the host would have no main entry to reload.

### Modules provided by the host

The host publishes its singletons on `globalThis.FreelensExtensionApi`, and
each process publishes only the ones it has. This is contract C3 of the
Freelens extension API (`docs/extensions/api.md` in freelensapp/freelens):

| Module id           | Global            | Published in |
| ------------------- | ----------------- | ------------ |
| `react`             | `React`           | renderer     |
| `react-dom`         | `ReactDom`        | renderer     |
| `react/jsx-runtime` | `ReactJsxRuntime` | renderer     |
| `mobx`              | `Mobx`            | both         |
| `mobx-react`        | `MobxReact`       | renderer     |
| `monaco-editor`     | `MonacoEditor`    | renderer     |

`build/vite-plugin-host-modules.mjs` replaces a bare import of one of these
with a module that reads the global, in the extension's code and in every
library it bundles. Its named exports are the members of the copy installed as
a devDependency, which is pinned to the host's version, so an import of a name
the host's version lacks fails the build. The plugin also fails the build on an
import of a host module that the process does not publish (`react` in main),
and on a subpath of a host package that the host does not publish
(`react-dom/client`, `react/jsx-dev-runtime`). Both would otherwise either read
`undefined` at runtime or bundle a second copy. A second React throws
`invalid hook call`; a second mobx throws nothing, and the host simply never
reacts to its observables.

Everything else is bundled: `js-yaml`, `js-base64`, `moment`, and
`@freelensapp/extensions`, a shim of three lines that reads `Common`, `Main`
and `Renderer` off the same global; it must not be mapped. `react-router-dom`
is not part of the host; navigation goes through `Renderer.Navigation` and
`Renderer.Component.MaybeLink`. The host installs no dependencies of an
extension, so whatever the code needs at runtime and the host does not provide
has to be in the bundle.

### Process-specific settings

- **Renderer**: nothing is external. Renderer code gets no Node or Electron, and
  an import of a Node builtin or of `electron` fails the build (Vite would
  otherwise replace it with an empty module and only warn).
  `process.env.NODE_ENV` is replaced at build time, because library mode
  leaves it for a consumer's bundler and the page has no `process`.
- **Main**: Node builtins (`node:*` and bare) and `electron` stay external.
  Bundled packages resolve with Vite's server conditions, so main gets their
  Node builds rather than their browser builds.

### Decorators

MobX 7 supports standard decorators only, and Oxc, which transpiles TypeScript
for Vite, passes them through unlowered, while neither Node nor Chromium runs
them yet. `build/vite-plugin-standard-decorators.mjs`, copied from Freelens,
hands every module with a decorator to esbuild first, which lowers the
decorators and their `accessor` fields. Both `vite.config.mjs` and
`vitest.config.ts` use it. A decorator that reaches the host or a test
unlowered is a syntax error when the module is evaluated.

An observable field is an `accessor` (`@observable accessor enabled = false;`),
and the class does not call `makeObservable(this)`. `@observable` on a plain
field type-checks and builds; the development build of mobx throws when the
class is defined, and the production build leaves the field unobservable.

An `@observer` class component reads `this.props` in its own `render()` only.
mobx-react 10 throws `Cannot read "X.props" in a reactive context` on a read in
any other derivation: a `@computed` getter of the component, and also a plain
method that the host calls from its own computed value or observer, such as
`getItems` and `customizeHeader` of `KubeObjectListLayout`. `render()` passes
such a callback the props it needs. Nothing before runtime reports it, so a
component with such a callback gets a jsdom test (`fluxcd-events.test.tsx`).

### CSS

The host links the stylesheet named after the renderer entry, `renderer.css`
next to `renderer.js`. Library mode extracts the CSS of the whole bundle into
that one file (`build.lib.cssFileName`). A build that emits more than one CSS
asset, or a differently named one, leaves the extension unstyled. A component
imports its CSS module for the class names only and renders no `<style>` tag;
the rules reach the page through `renderer.css`. CSS modules use
`camelCaseOnly` class names.

### CSS module declarations

`build/vite-plugin-css-module-declarations.mjs`, copied unchanged from
freelensapp/freelens-example-extension, writes `x.module.d.scss.ts` next to
every `x.module.scss` the renderer build imports, in `vite build` and in watch
mode. It takes the class names from Vite's own `preprocessCSS`, with the
build's resolved config, so they are the names the bundle exports, after
`localsConvention`; a class inside `:global(...)` is not one of them.

The plugin is written so that a build cannot leave a committed declaration
empty or partial, whether it fails, is interrupted or is killed: it awaits its
work in `transform`, it writes a declaration only when the content changed, and
it writes to a temporary `*.tmp` file that it renames over the declaration.

## TypeScript

Main code runs in Node, renderer code in a browser page, and common code in
both. Each is type-checked in a program of its own, so that an API the runtime
does not have fails `pnpm type:check` rather than the extension:

| Config                       | lib                       | types                 | Files                                                              |
| ---------------------------- | ------------------------- | --------------------- | ------------------------------------------------------------------ |
| `src/main/tsconfig.json`     | ES2024                    | `node`                | `src/main/`, `src/common/`                                         |
| `src/renderer/tsconfig.json` | ES2024, DOM, DOM.Iterable | `vite/client`         | `src/renderer/`, `src/common/`                                     |
| `src/common/tsconfig.json`   | ES2024, WebWorker         | none                  | `src/common/`                                                      |
| `src/tsconfig.json`          | ES2024, DOM, DOM.Iterable | `node`, `vite/client` | `*.test.ts(x)` under `src/`, and `test/`                           |
| `tsconfig.json`              | ES2024                    | `node`                | `vite.config.mjs`, `vitest.config.ts`, `svgo.config.mjs`, `build/` |

All of them extend `tsconfig.base.json`, which has the compiler options of
Freelens's fixture extension: `strict`, `moduleResolution: Bundler`,
`useDefineForClassFields`, `noUncheckedSideEffectImports` and `skipLibCheck`
among them. `skipLibCheck` is required: `extension-api.d.ts` is one declaration
for both processes and names DOM types and the `Electron` namespace, which no
single program has. Write `types` in every config; it decides which `@types`
packages a program sees. No config sets `experimentalDecorators`: decorators
are standard ones (see "Decorators").

### Main, renderer and common

The main and renderer configs both include `src/common/`. Compiled as main,
common code fails on the DOM; compiled as renderer, it fails on Node. What
passes both is valid in both, and that is the check that decides. Common code
uses only what both runtimes have: `globalThis.crypto`, `TextEncoder` and
`TextDecoder`, `URL` and `URLSearchParams`, `AbortController`,
`structuredClone`, and the timers, with the timer handle kept opaque.

`src/common/` has no source file yet; only its `tsconfig.json`. Keep it: the
editor uses it for a file put there, and the environment tests extend it. Its
`WebWorker` lib is the closest single match and an approximation: `self` and
`postMessage` compile there and fail in the main program.

The common program is not compiled on its own. `environment-tests/tsconfig.json`
extends `src/common/tsconfig.json` and keeps its `include`, so
`tsc -p environment-tests`, in `pnpm type:check:environments`, compiles
`src/common/` with the common settings, together with the probes. A program of
`src/common/` alone has no input while the directory has no source file, and
`tsc` stops on that (TS18003); the environment tests always have their probes.

The split does not cover the API namespaces: `Main` and `Renderer` compile in
every program, and the one the process does not have is `undefined` at runtime.
Common code uses `Common`.

### Asset imports

The renderer program has `vite/client`, which declares `*?raw`, `*?inline` and
the CSS modules and brings no Node into the program. With
`allowArbitraryExtensions`, `import styles from "./x.module.scss"` resolves to
the generated `x.module.d.scss.ts`, so a class name that the stylesheet lacks
fails the check. Without that file, after `pnpm clean:dts`, the import falls
back to the untyped declaration of `vite/client`.

### Environment tests

`types` and `lib` alone do not keep an environment pure. A declaration file
with `/// <reference types="node" />` loads all of `@types/node` into any
program that reaches it, whatever `types` says, and one with
`/// <reference lib="dom" />` loads the DOM. `environment-tests/` proves the
split holds:

| File             | Compiled with          | Must                      |
| ---------------- | ---------------------- | ------------------------- |
| `node-apis.ts`   | renderer, common       | fail on every marked line |
| `dom-apis.ts`    | main, common           | fail on every marked line |
| `worker-apis.ts` | main                   | fail on every marked line |
| `shared-apis.ts` | main, renderer, common | pass                      |

Each line that must fail carries `// @ts-expect-error`, so a program that
starts accepting it fails with an unused directive. The configs there extend
the source configs and keep their `include`, so the probes are compiled
together with the sources and every declaration the sources reach. Compiled
alone, they would not see a declaration that a dependency of the sources brings
in.

When a declaration leaks, the environment tests fail; keep the leak out rather
than relax a probe. For Node in the renderer, point `typeRoots` of the renderer
config at a directory with an empty `node` package, which a reference directive
resolves to first. For the DOM in main, remove the directive from the
declaration with `pnpm patch`.

### Tests and tooling

Tests are not in the environment programs. Vitest runs them in Node, with
jsdom for files that ask for it, so `src/tsconfig.json` gives them the DOM and
Node. It sits in `src/` so that an editor finds it for a test file: the
environment config next to the test excludes it, and the editor goes on to the
next `tsconfig.json` up the tree. Tests compile against the real
`@freelensapp/extensions` declaration, while Vitest replaces the package with a
stub at runtime.

No config declares the Vitest globals. TypeScript has no per-file globals, so
declaring `describe` or `vi` for tests would declare them for every file in the
program. Test and test-support files import what they use:

```ts
import { describe, expect, it, vi } from "vitest";
```

The module resolves from every program, so Biome keeps it out of the
extension's code: `style/noRestrictedImports` rejects an import of `vitest`
outside `src/**/*.test.*`, `test/` and `integration/`. `globals: true` stays on in
`vitest.config.ts` at runtime only, because React Testing Library registers its
automatic cleanup only when `afterEach` is a global. A test that renders a
component opts into jsdom with `// @vitest-environment jsdom` at the top of the
file; the others run in Node.

`@freelensapp/extensions` is stubbed because the real package cannot run in a
test: it is a shim that reads `Common`, `Main` and `Renderer` off
`globalThis.FreelensExtensionApi`, which only the host sets, and it ships no
mocks. The `alias` in `vitest.config.ts` points the import at
`test/stubs/freelensapp-extensions.ts`, for the tests and for the extension code
they import. The stub covers only what the tests use, at runtime only; the type
check still uses the real declaration. So a test that reaches a member the stub
lacks compiles and fails on `undefined`: add the member to the stub, as small as
the test needs. Its `getStore()` throws, as the host's does for a version the
cluster does not serve; a test that needs a store spies on `getStore` of the
class. The other host modules are not stubbed: `react`, `mobx` and
`mobx-react` resolve to the devDependencies, the host's versions.

The root `tsconfig.json` checks the tooling files. It has `checkJs`, so the
Vite config and the build plugins are type-checked too; give their function
parameters JSDoc types.

## Lint and CI

### Biome

`biome.jsonc` has the formatter, import groups and rules of Freelens. Two
overrides are specific to how the extension is laid out:

- `style/noRestrictedImports` keeps `vitest` out of the extension's code (see
  "Tests and tooling").
- `correctness/noNodejsModules` rejects a Node builtin import in
  `src/renderer/` and `src/common/`, tests left out. It flags the import in the
  editor, before `pnpm type:check` does; it does not see Node globals such as
  `Buffer` or `process`, which only the type check catches.

Every path in an override starts with `**/`. Trunk runs Biome from a sandbox
outside the repository, with `--config-path` pointing back at `biome.jsonc`,
and there a path anchored at the repository root matches no file, so the
override silently does nothing. A plain `biome check` matches both forms, so
only `trunk check` shows the difference.

In that sandbox, Biome also cannot apply `vcs.useIgnoreFile`: since 2.5.15 it
matches every target against the repository's `.gitignore` and panics on a
path outside the repository root, so every file fails. The Biome commands in
`.trunk/trunk.yaml` pass `--vcs-use-ignore-file=false`, because Trunk applies
`.gitignore` itself before it picks the targets; `biome.jsonc` keeps the
setting on for `pnpm biome` and editors.

Renovate updates Biome, in the `biome` script and in `.trunk/trunk.yaml`, but
cannot run `biome migrate`. `biome-migrate.yaml` runs it on the Renovate
branch and commits the migrated `biome.jsonc` there, so that the update and its
migration are one pull request. The commit is by `github-actions[bot]`, which
`gitIgnoredAuthors` in `.renovaterc.json` lists, so that Renovate does not take
it for a manual edit and stop updating the branch.

Biome does not read SCSS; Prettier formats it, through `pnpm prettier:fix` or
Trunk.

### Knip

`pnpm knip:check` runs knip twice, for unused files and for dependencies: a
development pass over everything, and a `--production --strict` pass over the
code that reaches the bundles, which are the entries marked with `!` in
`knip.jsonc`. In the production pass only `dependencies` count. The
host-provided modules and the bundled libraries (`js-base64`, `js-yaml`,
`moment`) are devDependencies, and are ignored.

A file is unused when no entry reaches it: a leftover module, a barrel that
nothing imports. The production pass starts from the `!` entries only, so it
also reports a module that only tests import. The fix is to remove the file,
not to ignore it. The check does not include unused exports and types: on this
tree they are mostly the exported spec and status types of the models.

`knip.jsonc` lists the entries knip cannot find: the two source entries, the
Vitest alias target `test/stubs/freelensapp-extensions.ts` and the probes in
`environment-tests/`. Its Vite plugin is off: it adds the renderer entry of
`vite.config.mjs` as a development entry, which displaces
`src/renderer/index.tsx!`, and the production pass then skips the renderer.
`--no-config-hints` is set because one config serves both passes, and an entry
that only the production pass needs is reported as redundant by the other.

Two more settings keep the file check to real findings. `project` leaves out
the CSS module declarations with `!src/**/*.d.scss.ts`: TypeScript reaches them
through `allowArbitraryExtensions`, while knip resolves
`import styles from "./x.module.scss"` to the stylesheet, so nothing would
import them. The negation has no trailing `!`, which would apply it to the
production pass only. And the SVGO plugin is on (`"svgo": true`), so that
`svgo.config.mjs` is an entry: Trunk runs SVGO, and no dependency turns the
plugin on.

### Workflows

| Workflow                 | Runs                                                                          |
| ------------------------ | ----------------------------------------------------------------------------- |
| `type-check.yaml`        | `pnpm type:check`                                                             |
| `check.yaml`             | `pnpm build`, `pnpm lint:check`, `pnpm knip:check`                            |
| `unit-tests.yaml`        | `pnpm test:unit`                                                              |
| `trunk-check.yaml`       | `trunk check --all`                                                           |
| `integration-tests.yaml` | the integration tests in `integration/`, against a Freelens build             |
| `mise-lock-check.yaml`   | on a change to `mise.lock`: no checksum changed for an unchanged tool version |

The type check has a workflow of its own, on pull requests and on pushes to
`main`, as in Freelens. It runs every program, tests, tooling and environment
tests included, which no build reaches, and a type error shows as its own
failed check rather than as a failed build. `check.yaml` builds without the
type check for the same reason, so it does not run twice.

The integration tests run inside a Freelens checkout: the workflow builds the
extension, packs it with a `.tgz.sha256` checksum next to the tarball, as the
release publishes it, checks out and packages Freelens, copies
`integration/__tests__/` into `freelens/integration/__tests__/` and runs them
there under Freelens's Vitest, with its helpers. The test installs the
tarball from the extensions page and fails on any error logged by either
process.

## Checking the Extension in Freelens Dev

The functional checks of a change run against Freelens started with
`pnpm dev` from a freelensapp/freelens checkout. That script starts Electron
with `--remoteDebuggingPort 9223`, so an agent can drive the app over the
Chrome DevTools Protocol. How to attach Playwright MCP to it is in Freelens's
`DEVELOPMENT.md`, "Inspecting the running dev app from an AI agent"; start
Freelens before the session connects. Playwright MCP writes its snapshots to
`.playwright-mcp/`, which is git-ignored.

Without the MCP server, a `playwright-core` script with
`chromium.connectOverCDP("http://127.0.0.1:9223")` does the same. End such a
script by exiting the process; do not close the browser, which belongs to
Freelens.

The checks need a cluster with Flux, and with the Flux Operator for the
`fluxcd.controlplane.io` kinds, and objects of the kinds under test; a kind
whose CRD is missing shows the "not available" page instead.

### Installing the checkout

1. `pnpm install`, then `pnpm build`. After a branch switch, `node_modules`
   can still hold another stack, and Freelens loads the extension from
   `dist/`.
2. On the Extensions page, enter the checkout's directory and press
   "Install". Freelens then asks whether to load the extension in place;
   confirm that too. The table lists the extension as "in place, unverified"
   and enabled.
3. A rebuild, by `pnpm build` or by `pnpm dev` of the extension, reloads it
   once in the root frame and once in each cluster frame.

### Driving the UI

- Every cluster renders in a cross-origin `<clusterId>.renderer.freelens.app`
  iframe. Pages, menus and details of the extension live in that frame, not
  in the main page.
- Pages of the extension have URLs like `/extension/<name>/<pageId>`, with the
  package name's `@` dropped and `/` turned into `--`: the Overview is
  `/extension/freelensapp--fluxcd-extension/dashboard`, and a resource page
  has the singular name of its kind as page id, for example
  `/extension/freelensapp--fluxcd-extension/gitrepository`. The sidebar
  entries navigate in `onClick`; their `href` is not the page URL.
- Playwright's actionability checks can fail on the hotbar, where
  `#ScrollSpyRoot` intercepts pointer events; a DOM `click()` on the element
  works.
- Views fill in once the host's stores have loaded. Wait for the expected
  content, not a fixed time, before deciding that a page is empty. A list
  shows the selected namespaces only, so choose the namespaces of the test
  objects first.

### Reading the console

The renderer console also carries the output of Freelens's terminal dock
(`%cMESSAGE` lines), which can include the user's shell prompt, account names
and paths. Keep only warnings, errors, page errors and the extension's own
lines, and never paste the full console into a PR, an issue or a report.
React reports key problems as console errors ("Each child in a list should
have a unique key", "Encountered two children with the same key"); they count
as failures of the "no error in DevTools" check. React reports each component
once per frame, so open every details drawer in a fresh cluster frame to see
them all.

## Code Style

- **Biome** formats **TypeScript/TSX, JS, JSON, CSS, HTML**: double quotes, semicolons, trailing commas, 2-space indent, 120 char line width — use `pnpm biome:fix`
- **Prettier / Trunk** format **SCSS, Markdown, YAML**, and other formats not covered by biome — use `pnpm prettier:fix` (or `pnpm trunk:fix`)
- Import order (enforced by biome organizeImports): built-in modules → `@freelensapp/**` → packages → relative paths
- **No emoji** in Markdown files (`.md`), comments, or any source code

## Security

Never read, display, reference, or include the contents of the following files in any response or context, even if they are open in the editor:

- `.env`
- `.env.*`
- `.envrc`
- `.npmrc`
- `*.jks`
- `*.keystore`
- `*.p12`
- `*.pfx`
- `*.pem`
- `*.key`

The same list is git-ignored in `.gitignore` and enforced for Claude Code by
the `permissions.deny` rules in `.claude/settings.json`, which block reading
and editing these files. Change all three together. The rules are native
permissions rather than a hook on purpose: a hook runs a process in the
working tree, which may be an untrusted pull request, and an interpreter such
as `python3 -c` imports modules from that tree before the hook's own code.

## Electron Multi-Process

Extensions run in the same multi-process model as the Freelens host:

- **Main process** (`src/main/`) — Node.js environment, extension lifecycle, cluster connectivity
- **Renderer process** (`src/renderer/`) — Chromium browser, UI components

## Troubleshooting

### Changes Not Appearing

1. Check that files are not in ignored output directories (`dist/`, `node_modules/`)
2. Full clean and rebuild: `pnpm clean:all && pnpm install && pnpm build`
3. With a directory install, check that `pnpm dev` is running: Freelens reloads the extension after each rebuild. A
   change to `main` or `renderer` in `package.json` needs Freelens restarted once
4. With a tarball install, pack and install the extension again (`pnpm pack:dev`)

### Build Failures

1. Check for TypeScript errors: `pnpm type:check`
2. Check for linting errors: `pnpm lint:check`
3. Verify dependencies: `pnpm install`
4. Check Node.js version matches the `engines` field in `package.json`

### Runtime Errors

1. Open Freelens DevTools and check the Console tab for renderer errors
2. Check the terminal where Freelens was launched for main process errors
3. Look for stack traces with file:line numbers
4. Verify all CRD objects have proper `static readonly` properties (kind, apiBase, crd)
5. Validate both with `pnpm type:check` **and** `pnpm build` — runtime failures can appear only in bundled `dist/` code
6. Go through "Rules That Fail Silently": most runtime errors of a v2 extension that pass every check are listed there

## Best Practices

1. **Use semantic search** to find examples and patterns in the codebase
2. **Follow existing patterns** — grep for similar implementations before creating new ones
3. **Test changes** before committing
4. **Run validation before committing:** `pnpm lint:fix && pnpm type:check && pnpm test:unit && pnpm build`, and
   `pnpm knip:check` after adding, moving or removing a file or a dependency
5. **For TypeScript/TSX, JS, JSON, CSS, HTML files:** run `pnpm biome:fix` (or `biome check` directly if `biome` is installed locally)
6. **For SCSS, Markdown, YAML, and other formats:** run `pnpm prettier:fix` or `pnpm trunk:fix`
7. **Full build** when in doubt about cached state: `pnpm clean:all && pnpm install && pnpm build`
8. **Check the rules that fail silently** ("Rules That Fail Silently") against every change to the build, the
   components or the models: the type check, the build and the unit tests do not catch them
9. **Do not use Anthropic Fable for coding tasks** — Fable may be used only for planning,
   analysis, and thinking through problems. When writing or editing code,
   use standard editing tools instead.

## GitHub Actions (Claude Code Action) Rules

This project has a Claude Code workflow (`.github/workflows/claude.yaml`) triggered
via `@claude` comments on issues, PR comments, and reviews. When operating via that
workflow, follow these rules:

### Code Review

When reviewing code and proposing fixes:

1. **Show the diff first** — present every proposed change as a unified diff
   block using the `diff` language tag:

   ```diff
   --- a/path/to/file.ts
   +++ b/path/to/file.ts
   @@ -10,7 +10,7 @@
    const oldLine = "before";
   -const changedLine = "after";
   +const changedLine = "the fix";
    const unchangedLine = "same";
   ```

   You can generate this from the terminal with:
   ```bash
   git diff -u -- path/to/file
   ```

   If the change spans multiple files, group them under a single commit
   subject and show each file's diff sequentially.

2. **Propose a commit subject first** — before any code change, output a
   single line with the proposed commit subject:

   ```text
   **Proposed commit:** <short description>
   ```

   Do **not** use Conventional Commits prefixes (e.g. `fix:`, `feat:`,
   `chore:`, `refactor:`, `docs:`, `test:`, `ci:`). This project prefers
   plain, descriptive commit messages and PR titles without any prefix.

   Wait for the user to confirm (or adjust) the subject before applying the
   change.

3. **Comment style:**
   - Keep review comments concise and actionable
   - Reference specific lines (file + line number) when pointing out issues
   - Offer a concrete fix suggestion rather than just flagging a problem
   - Do **not** use emoji in any Markdown, comments, commit messages, or
     PR descriptions. The only exception is emoji that already appears
     inside code strings (e.g. application logs, user-facing messages).
   - Use GitHub's `suggestion` block for small targeted fixes so the PR
     author can accept the change with a single click:

     ````suggestion
     <same unified-diff format as shown above>
     ````

   - For larger multi-file changes, use `diff -u` blocks in a regular
     comment instead, with the proposed commit subject shown first

### Making Changes to a PR

When asked to implement a change on a PR:

1. Propose the commit subject (as above)
2. Describe what will change and why
3. After confirmation, apply the changes with commits on the PR branch
4. **One commit per fix** — when a review surfaces more than one issue or
   the plan includes more than one fix, apply and commit each fix
   separately. Do not batch multiple independent fixes into a single
   commit. This keeps the history bisectable and makes each change easy
   to revert individually.

### Modifying GitHub Actions Workflows

Claude cannot push changes to files under `.github/workflows/` directly,
because the GitHub token used by the action lacks the `workflows` permission.
Any patch to a workflow file MUST therefore be delivered as a new, complete
file under the `github-workflow-fix/` directory in the repository root instead
of editing the file in place:

1. Write the full, final contents of the workflow to
   `github-workflow-fix/<workflow-file-name>`, with the same file name as in
   `.github/workflows/` (e.g. `github-workflow-fix/check.yaml`). Do **not**
   edit the original file under `.github/workflows/`.
2. Make it a **complete** file — the entire workflow as it should look after
   the change, not just a diff or fragment — so it can be copied verbatim.
3. Commit it with the change that needs it, and list it in the report. In the
   PR description, note it as a proposed workflow change that a maintainer
   must move from `github-workflow-fix/` to `.github/workflows/`.

A maintainer moves the file into `.github/workflows/` in a separate commit and
removes `github-workflow-fix/`. Pull before continuing on the branch, as it may
have gained such a commit. Until then, the development pass of
`pnpm knip:check` still reads the workflows under `.github/workflows/`, so a
dependency that only the old workflow uses is reported there.

### Branch Naming Conventions

When creating a branch from an issue, use a human-readable name that includes
the issue number and a short slug derived from the issue title:

```text
claude/issue-<number>-<short-slug>
```

- `<number>` is the GitHub issue number
- `<short-slug>` is a kebab-case summary of the issue title, kept short
  (3–6 words maximum, omit articles and filler words)

Do **not** use auto-generated timestamp suffixes (e.g.
`claude/issue-1957-20260612-2108`) — these are not human-readable and make
branch lists hard to scan.

### Fork PRs: Review Only

A PR from a fork (different owner than `freelensapp`) gets a review and
nothing else: no commits, no pushes, no branches. Its code is untrusted, and
the head of a fork PR can change between the moment a maintainer looks at it
and the moment the workflow checks it out, so nothing taken from the checkout
may reach `freelensapp/freelens-fluxcd-extension`.

When a fork PR needs changes, a maintainer first copies the exact commit they
reviewed to a branch in this repository. From then on it is a
same-repository PR, which gets the full setup and the normal workflow. The
copy is made either locally (`gh pr checkout <N>`, then push the branch) or
by the Claude Task workflow, following "Copying a Fork PR" below.

### Copying a Fork PR

This applies to a Claude Task run whose prompt asks to copy a fork PR and
names the PR number and the full commit SHA to copy. It is a git-only task:
do not check out, read, build or run any of the PR's files, and do not
describe its changes, because they are untrusted input.

1. `git fetch origin refs/pull/<N>/head`.
2. Verify that `FETCH_HEAD` equals the given SHA. If it does not, or no full
   SHA was given, stop and report the actual head without pushing anything.
3. `git push origin <sha>:refs/heads/claude/pr-<N>`.
4. Open a PR from `claude/pr-<N>` to `main`. It MUST use the **exact same
   title** as the original PR, copied verbatim with no prefix, and its body
   is `Copy of #<N> at <sha>.` followed by the usual footer.
5. Comment on the original PR with a link to the new one.
