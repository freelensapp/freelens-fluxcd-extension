/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Writes a TypeScript declaration next to every CSS module the build imports:
// `x.module.scss` gets `x.module.d.scss.ts`, with one `readonly` member per
// class name. With `allowArbitraryExtensions`, TypeScript resolves
// `import styles from "./x.module.scss"` to that file, so a class name the
// stylesheet lacks fails the type check. The declarations are committed,
// because the type check runs without a build.
//
// The class names come from Vite's own `preprocessCSS`, with the resolved
// config of the build, so the preprocessor options and
// `css.modules.localsConvention` apply exactly as they do to the bundle.
//
// A failed or interrupted build must not leave a committed declaration
// truncated: the work is awaited in `transform`, so the build does not finish
// or fail while a write is pending, and a declaration is written to a
// temporary file next to it and renamed over it, which replaces it whole or
// not at all. An unchanged declaration is not written, so a build that changes
// no stylesheet touches no file.

import { randomBytes } from "node:crypto";
import { readFile, rename, rm, writeFile } from "node:fs/promises";
import { preprocessCSS } from "vite";

const cssModule = /\.module\.(css|less|sass|scss|styl|stylus)$/;
const identifier = /^[A-Za-z_$][\w$]*$/;

/**
 * @param {string[]} classNames
 * @returns {string}
 */
function renderDeclaration(classNames) {
  const members = classNames.map((name) => {
    const key = identifier.test(name) ? name : JSON.stringify(name);
    return `  readonly ${key}: ${JSON.stringify(name)};\n`;
  });

  return `declare const classNames: {${members.length > 0 ? `\n${members.join("")}` : ""}};\nexport = classNames;\n`;
}

/**
 * Replaces the file with the content, unless it has the content already.
 *
 * @param {string} path
 * @param {string} content
 */
async function writeIfChanged(path, content) {
  const current = await readFile(path, "utf8").catch(() => undefined);

  if (current === content) {
    return;
  }

  const temporary = `${path}.${randomBytes(6).toString("hex")}.tmp`;

  try {
    await writeFile(temporary, content);
    await rename(temporary, path);
  } finally {
    await rm(temporary, { force: true });
  }
}

/** @returns {import("vite").Plugin} */
export function cssModuleDeclarations() {
  /** @type {import("vite").ResolvedConfig} */
  let config;
  // The same stylesheet can be imported with different queries (`?inline`),
  // so the writes of one declaration are queued, never run side by side.
  /** @type {Map<string, Promise<void>>} */
  const writes = new Map();

  return {
    name: "freelens:css-module-declarations",

    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },

    async transform(_code, id) {
      const path = id.split("?", 1)[0];
      const match = cssModule.exec(path);

      if (!match || path.startsWith("\0") || path.includes("/node_modules/")) {
        return null;
      }

      const declarationPath = `${path.slice(0, match.index)}.module.d.${match[1]}.ts`;
      const source = await readFile(path, "utf8");
      const { modules } = await preprocessCSS(source, path, config);
      const content = renderDeclaration(Object.keys(modules ?? {}));

      const write = (writes.get(declarationPath) ?? Promise.resolve())
        .catch(() => {})
        .then(() => writeIfChanged(declarationPath, content));

      writes.set(declarationPath, write);
      await write;

      return null;
    },
  };
}
