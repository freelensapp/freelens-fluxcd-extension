/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Builds the extension's two entry points, one per run: the renderer with
// `vite build`, the main entry with `vite build --mode main`. The renderer runs
// in a browser page and main in Node, so they cannot share settings, and each
// bundle carries its own copy of `src/common/` rather than a chunk the other
// process would have to load.

import { builtinModules, isBuiltin } from "node:module";
import react from "@vitejs/plugin-react";
import { defaultServerConditions, defaultServerMainFields, defineConfig } from "vite";
import { cssModuleDeclarations } from "./build/vite-plugin-css-module-declarations.mjs";
import { hostModules } from "./build/vite-plugin-host-modules.mjs";
import { standardDecorators } from "./build/vite-plugin-standard-decorators.mjs";

const entryPoints = {
  renderer: {
    entry: "src/renderer/index.tsx",
    // First of the two runs in `build`, so it clears the output directory.
    // `dev` turns this off: in watch mode Vite empties the directory again on
    // every rebuild, which would delete the main entry.
    emptyOutDir: true,
    // Renderer code gets no guarantee of Node or Electron, so nothing is left
    // for the runtime to resolve.
    external: [],
  },
  main: {
    entry: "src/main/index.ts",
    emptyOutDir: false,
    // Node and Electron resolve their own modules at runtime.
    external: ["electron", /^electron\//, /^node:/, ...builtinModules],
  },
};

/**
 * Fails the renderer build on an import of Node or Electron. Vite would replace
 * a builtin with an empty module and only warn, so the import would be
 * `undefined` when the extension runs.
 *
 * @type {import("vite").Plugin}
 */
const noNodeInRenderer = {
  name: "no-node-in-renderer",
  enforce: "pre",
  resolveId(source, importer) {
    if (isBuiltin(source) || source === "electron" || source.startsWith("electron/")) {
      this.error(`"${source}" is imported by ${importer}, but renderer code gets no Node or Electron`);
    }
    return null;
  },
};

export default defineConfig(({ mode }) => {
  const name = mode === "main" ? "main" : "renderer";
  const entryPoint = entryPoints[name];

  return {
    plugins: [
      // Oxc, which transpiles TypeScript for Vite, passes standard decorators
      // through unlowered, and neither Node nor Chromium runs them yet.
      standardDecorators(),
      hostModules(name),
      // JSX with the automatic runtime, so it imports `react/jsx-runtime`.
      react(),
      // The committed `*.module.d.scss.ts` declarations of the CSS modules.
      ...(name === "renderer" ? [noNodeInRenderer, cssModuleDeclarations()] : []),
    ],
    css: {
      modules: {
        localsConvention: "camelCaseOnly",
      },
    },
    ...(name === "renderer"
      ? {
          // Library mode leaves `process.env.NODE_ENV` for a consumer's
          // bundler to replace, but the bundle is loaded as it is, by a page
          // with no `process`.
          define: { "process.env.NODE_ENV": JSON.stringify("production") },
        }
      : {
          // Main runs in Node: pick the Node builds of bundled packages, not
          // their browser builds.
          resolve: { conditions: [...defaultServerConditions], mainFields: [...defaultServerMainFields] },
        }),
    build: {
      target: "esnext",
      minify: false,
      sourcemap: true,
      emptyOutDir: entryPoint.emptyOutDir,
      lib: {
        entry: entryPoint.entry,
        formats: ["es"],
        fileName: () => `${name}.js`,
        // The host links `<entry>.css` next to the renderer entry. Library
        // mode extracts the CSS of the whole bundle into this one file.
        cssFileName: name,
      },
      rolldownOptions: {
        external: entryPoint.external,
      },
    },
  };
});
