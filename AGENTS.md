# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

> **Tip**: If you find yourself correcting the agent during interactive work, suggest adding a new rule to this file so the lesson is captured for future sessions.

## Project Overview

This repository integrates FluxCD support into the Freelens application. It
provides dashboards, detail views, cluster pages, and resource menus (reconcile,
suspend, resume) for FluxCD v2 custom resources.

- **Language**: TypeScript 5.9.3
- **Runtime**: Node.js >= 22.0.0, Freelens >= 1.6.2
- **Package manager**: pnpm 10.x (locked)
- **License**: MIT

## Common Commands

```bash
# Type checking
pnpm type:check

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
pnpm build                # Full build (type-check + electron-vite)
pnpm build:production     # Production build (VITE_PRESERVE_MODULES=false)
pnpm build:force          # Build without the type-check prestep

# Pack for testing
pnpm pack:dev             # Bump prerelease version, build, and create .tgz for install in Freelens app

# Clean
pnpm clean                # Clean out/
pnpm clean:dts            # Remove generated *.d.scss.ts files
pnpm clean:all            # Clean everything (dts, node_modules, out, tgz)
```

There are no unit tests in this repository; validation is done via
`pnpm type:check` and `pnpm build`. End-to-end behavior is exercised by the
integration tests in `.github/workflows/integration-tests.yaml`.

## Architecture

```text
src/
  main/index.ts                        # Extension entry point (main process, CJS)
  renderer/index.tsx                   # Extension entry point (renderer process, CJS)
  renderer/k8s/fluxcd/                 # K8s object model classes, grouped by controller
                                       #   (source, kustomize, helm, image, notification, controlplane)
  renderer/k8s/core/                   # Core K8s object models
  renderer/components/details/         # Detail view components, grouped by controller
  renderer/pages/                      # Cluster page components, grouped by controller
  renderer/menus/                      # Resource menu items (reconcile, suspend, resume)
  renderer/components/                 # Shared components (status, charts, YAML dump, etc.)
  renderer/icons/                      # SVG icons
  renderer/utils.ts                    # Utility functions
```

Build output goes to `out/`.

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

## Renderer Components

- Detail views and pages are grouped by FluxCD controller (source, kustomize, helm, image, notification, controlplane).
- Shared spec/status widgets live in `src/renderer/components/` (e.g. `status-history`, `status-inventory`, `status-artifact`, `pie-chart`, `yaml-dump`).
- SCSS modules generate TypeScript type files (`*.module.d.scss.ts`) via the sass-dts plugin. These are auto-generated and should be cleaned with `pnpm clean:dts` when SCSS changes.

## Key Dependencies (provided by Freelens host at runtime)

These are NOT bundled, they come from the Freelens host as globals (see `electron.vite.config.js`):
- `@freelensapp/extensions` → `global.LensExtensions`
- `mobx` → `global.Mobx`
- `react` → `global.React`
- `react-dom` → `global.ReactDom`
- `react/jsx-runtime` → `global.ReactJsxRuntime`
- `mobx-react` → `global.MobxReact`
- `react-router-dom` → `global.ReactRouterDom`

Other dependencies ARE bundled into the extension output.

## Code Style

- **Biome** formats **TypeScript/TSX, JS, JSON, CSS/SCSS, HTML**: double quotes, semicolons, trailing commas, 2-space indent, 120 char line width — use `pnpm biome:fix`
- **Prettier / Trunk** format **Markdown, YAML**, and other formats not covered by biome — use `pnpm prettier:fix` (or `pnpm trunk:fix`)
- Import order (enforced by biome organizeImports): built-in modules → `@freelensapp/**` → packages → relative paths
- **No emoji** in Markdown files (`.md`), comments, or any source code

## Security

Never read, display, reference, or include the contents of the following files in any response or context, even if they are open in the editor:

- `.env`
- `.env.*`
- `.npmrc`
- `*.jks`
- `*.keystore`
- `*.p12`
- `*.pfx`
- `*.pem`
- `*.key`

## Electron Multi-Process

Extensions run in the same multi-process model as the Freelens host:

- **Main process** (`src/main/`) — Node.js environment, extension lifecycle, cluster connectivity
- **Renderer process** (`src/renderer/`) — Chromium browser, UI components

## Troubleshooting

### Changes Not Appearing

1. Check that files are not in ignored output directories (`out/`, `dist/`, `node_modules/`)
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
5. Validate both with `pnpm type:check` **and** `pnpm build` — runtime failures can appear only in bundled `out/` code

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
