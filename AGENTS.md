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
`@freelensapp/extensions` is pinned to one exact version. The libraries the
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
pnpm biome:check          # TypeScript/TSX, JS, JSON, CSS/SCSS, HTML (biome)
pnpm biome:fix            # Auto-fix the formats above
pnpm prettier:check       # Markdown, YAML, and other formats not covered by biome
pnpm prettier:fix         # Auto-fix Markdown, YAML, etc.
pnpm trunk:check          # Aggregated linters (runs prettier, markdownlint, etc.)
pnpm trunk:fix            # Auto-fix via trunk
pnpm lint:check           # Runs biome:check and prettier:check
pnpm lint:fix             # Runs biome:fix and prettier:fix

# Dead-code / dependency checks
pnpm knip:check           # Unused files, exports, and dependencies

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

There are no unit tests in this repository; validation is done via
`pnpm type:check` and `pnpm build`. End-to-end behavior is exercised by the
integration tests in `.github/workflows/integration-tests.yaml`.

## Architecture

```text
src/
  main/index.ts                        # Main entry (Main.LensExtension), ESM
  renderer/index.tsx                   # Renderer entry (Renderer.LensExtension): every registration, ESM
  renderer/k8s/fluxcd/                 # K8s object model classes, grouped by controller
                                       #   (source, kustomize, helm, image, notification, controlplane)
  renderer/k8s/core/                   # Core K8s object models
  renderer/components/details/         # Detail view components, grouped by controller
  renderer/pages/                      # Cluster page components, grouped by controller
  renderer/menus/                      # Resource menu items (reconcile, suspend, resume)
  renderer/components/                 # Shared components (status, charts, YAML dump, etc.)
  renderer/icons/                      # SVG icons
  renderer/utils.ts                    # Utility functions
  common/                              # Code for both processes (none yet; its tsconfig.json only)
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
- Shared components import their CSS module for the class names only, with no `?inline` import and no `<style>` tag;
  the rules reach the page through `renderer.css`.
- React keys for list items without a natural key come from `Renderer.Util.createReactKey(item)`.
- Renderer code has no Node: no `crypto`, `node:*` or other builtins. Use `Renderer.Util.sha256Hex` for SHA-256.
- Links inside components use `Renderer.Component.MaybeLink` (`to`, `onClick`); there is no `react-router-dom`.
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

The root `tsconfig.json` checks the tooling files. It has `checkJs`, so the
Vite config and the build plugins are type-checked too; give their function
parameters JSDoc types.

## Code Style

- **Biome** formats **TypeScript/TSX, JS, JSON, CSS/SCSS, HTML**: double quotes, semicolons, trailing commas, 2-space indent, 120 char line width — use `pnpm biome:fix`
- **Prettier / Trunk** format **Markdown, YAML**, and other formats not covered by biome — use `pnpm prettier:fix` (or `pnpm trunk:fix`)
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
2. Full clean and rebuild: `pnpm clean:all && pnpm build`
3. Reinstall the extension in Freelens (or restart the app in dev mode)

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

## Best Practices

1. **Use semantic search** to find examples and patterns in the codebase
2. **Follow existing patterns** — grep for similar implementations before creating new ones
3. **Test changes** before committing
4. **Run validation before committing:** `pnpm lint:fix && pnpm type:check && pnpm build`
5. **For TypeScript/TSX, JS, JSON, CSS/SCSS, HTML files:** run `pnpm biome:fix` (or `biome check` directly if `biome` is installed locally)
6. **For Markdown, YAML, and other formats:** run `pnpm prettier:fix` or `pnpm trunk:fix`
7. **Full build** when in doubt about cached state: `pnpm clean:all && pnpm build`
8. **Do not use Anthropic Fable for coding tasks** — Fable may be used only for planning,
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
