// Vite/Rolldown plugin that maps bare module ids (react, mobx, ...) to runtime
// globals provided by the Freelens host (global.React, global.Mobx, ...).
//
// This replaces `vite-plugin-external`, whose CommonJS shim
// (`module.exports = global.React`) only exposes a statically detectable
// `default` export. Rolldown discovers the *named* exports of such a CJS shim
// through a non-deterministic static-analysis / dep pre-bundle step, so builds
// intermittently failed with errors such as:
//
//   [MISSING_EXPORT] "forwardRef" is not exported by ".vite_external/react.js"
//
// when a third-party dependency (lucide-react, react-syntax-highlighter, ...)
// did `import { forwardRef } from "react"` and the detection lost the race.
//
// Instead, this plugin emits an ESM shim with *explicit* named exports, so the
// module graph is fully static and the build is deterministic:
//
//   const __m = global.React;
//   export default __m;
//   export const forwardRef = __m.forwardRef;
//   ...
//
// (Rolldown 1.0.3 does not support `syntheticNamedExports`, so the names must
// be materialized explicitly.) The export names are discovered at config time
// from the installed package, with no hardcoded lists.

const fs = require("node:fs");
const path = require("node:path");

// electron-vite bundles this config helper before running it, so __dirname is
// unreliable. Builds always run from the project root, so use the cwd.
const ROOT = process.cwd();

const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

// Names that are valid object keys but cannot be used as `export const <name>`.
const RESERVED = new Set([
  "default",
  "__esModule",
  "break",
  "case",
  "catch",
  "class",
  "const",
  "continue",
  "debugger",
  "delete",
  "do",
  "else",
  "enum",
  "export",
  "extends",
  "false",
  "finally",
  "for",
  "function",
  "if",
  "import",
  "in",
  "instanceof",
  "new",
  "null",
  "return",
  "super",
  "switch",
  "this",
  "throw",
  "true",
  "try",
  "typeof",
  "var",
  "void",
  "while",
  "with",
  "yield",
]);

function packageNameOf(id) {
  const parts = id.split("/");
  return id.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

// Resolve the on-disk entry of a module, falling back to the pnpm virtual store
// for host-only peer dependencies (react-dom, react-router-dom) that are not
// hoisted to the project root.
function resolveEntry(id) {
  try {
    return require.resolve(id, { paths: [ROOT] });
  } catch {}
  const pnpmDir = path.join(ROOT, "node_modules", ".pnpm");
  let entries = [];
  try {
    entries = fs.readdirSync(pnpmDir);
  } catch {
    return null;
  }
  const prefix = `${packageNameOf(id).replace(/\//g, "+")}@`;
  for (const dir of entries.filter((e) => e.startsWith(prefix)).sort()) {
    const base = path.join(pnpmDir, dir, "node_modules", packageNameOf(id));
    try {
      return require.resolve(id, { paths: [path.dirname(base)] });
    } catch {}
  }
  return null;
}

// Extract export names from a CJS/webpack bundle without executing it. Some host
// packages (e.g. @freelensapp/extensions) run browser-only code on require and
// cannot be loaded in Node at build time.
function namesFromSource(src) {
  const found = new Set();
  // webpack harmony exports: __webpack_require__.d(exports, { Name: () => ... })
  for (const block of src.matchAll(/__webpack_require__\.d\(\s*\w+\s*,\s*\{([\s\S]*?)\}\s*\)/g)) {
    for (const m of block[1].matchAll(/([A-Za-z_$][A-Za-z0-9_$]*)\s*:/g)) found.add(m[1]);
  }
  // plain CJS: exports.Name = ... / Object.defineProperty(exports, "Name", ...)
  for (const m of src.matchAll(/exports\.([A-Za-z_$][A-Za-z0-9_$]*)\s*=/g)) found.add(m[1]);
  for (const m of src.matchAll(/Object\.defineProperty\(\s*exports\s*,\s*["']([A-Za-z_$][A-Za-z0-9_$]*)["']/g))
    found.add(m[1]);
  return [...found];
}

function resolveExportNames(id) {
  const entry = resolveEntry(id);
  // Preferred: require the real module and read its keys.
  try {
    const real = require(entry || id);
    const keys = Object.keys(real).filter((n) => IDENTIFIER_RE.test(n) && !RESERVED.has(n));
    if (keys.length > 0) return keys;
  } catch {}
  // Fallback: static parse for modules that cannot be required in Node.
  if (entry) {
    try {
      return namesFromSource(fs.readFileSync(entry, "utf8")).filter((n) => IDENTIFIER_RE.test(n) && !RESERVED.has(n));
    } catch {}
  }
  return [];
}

/**
 * @param {Record<string, string>} globals map of module id -> global expression
 *   (e.g. { react: "global.React" }).
 */
function globalExternals(globals) {
  const PREFIX = "\0global-external:";
  const codeCache = new Map();
  return {
    name: "global-externals",
    enforce: "pre",
    resolveId(id) {
      if (Object.prototype.hasOwnProperty.call(globals, id)) {
        return { id: PREFIX + id, moduleSideEffects: false };
      }
      return null;
    },
    load(id) {
      if (!id.startsWith(PREFIX)) return null;
      const moduleId = id.slice(PREFIX.length);
      let code = codeCache.get(moduleId);
      if (code == null) {
        const globalName = globals[moduleId];
        const names = resolveExportNames(moduleId);
        code = [
          `const __m = ${globalName};`,
          `export default __m;`,
          ...names.map((name) => `export const ${name} = __m.${name};`),
        ].join("\n");
        codeCache.set(moduleId, code);
      }
      return { code, moduleSideEffects: false };
    },
  };
}

module.exports = { globalExternals };
