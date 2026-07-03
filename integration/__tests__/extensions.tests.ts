/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { expect } from "@jest/globals";
import * as utils from "../helpers/utils";

import type { ConsoleMessage, ElectronApplication, Page } from "playwright";

describe("extensions page tests", () => {
  let window: Page;
  let cleanup: undefined | (() => Promise<void>);
  const errorLogs: string[] = [];
  const processErrorLogs: string[] = [];
  const outputErrorPattern = /\[out\]\s*error:/i;
  const ansiEscapePattern = /\u001b\[[0-9;]*m/g;
  let processOutputBuffer = "";
  let restoreProcessOutputHooks: undefined | (() => void);

  const collectOutputErrors = (chunk: string | Uint8Array) => {
    const text = typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
    processOutputBuffer += text;

    // Keep buffer bounded while preserving enough tail to match split patterns across chunks.
    if (processOutputBuffer.length > 200_000) {
      processOutputBuffer = processOutputBuffer.slice(-20_000);
    }

    const normalizedOutput = processOutputBuffer.replaceAll(ansiEscapePattern, "");

    if (outputErrorPattern.test(normalizedOutput)) {
      processErrorLogs.push(normalizedOutput.trim());
      processOutputBuffer = "";
    }
  };

  const logger = (msg: ConsoleMessage) => {
    const text = msg.text();
    const normalizedText = text.replaceAll(ansiEscapePattern, "");

    console.log(text);

    // Some app logs are emitted as "log" messages, so inspect both console type and message content.
    if (msg.type() === "error" || outputErrorPattern.test(normalizedText)) {
      errorLogs.push(`[${msg.type()}] ${normalizedText}`);
    }
  };

  beforeAll(async () => {
    let app: ElectronApplication;

    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    const originalStderrWrite = process.stderr.write.bind(process.stderr);

    process.stdout.write = ((chunk, encoding, cb) => {
      collectOutputErrors(chunk);

      return originalStdoutWrite(chunk, encoding as never, cb as never);
    }) as typeof process.stdout.write;

    process.stderr.write = ((chunk, encoding, cb) => {
      collectOutputErrors(chunk);

      return originalStderrWrite(chunk, encoding as never, cb as never);
    }) as typeof process.stderr.write;

    restoreProcessOutputHooks = () => {
      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;
    };

    ({ window, cleanup, app } = await utils.start());
    window.on("console", logger);
    console.log("await utils.clickWelcomeButton");
    await utils.clickWelcomeButton(window);

    // Navigate to extensions page
    console.log("await app.evaluate");
    await app.evaluate(async ({ app }) => {
      await app.applicationMenu
        ?.getMenuItemById(process.platform === "darwin" ? "mac" : "file")
        ?.submenu?.getMenuItemById("navigate-to-extensions")
        ?.click();
    });

    // Trigger extension install
    const textbox = window.getByPlaceholder("Name or file path or URL");
    console.log("await textbox.fill");
    await textbox.fill(process.env.EXTENSION_PATH || "@freelensapp/fluxcd-extension");
    const install_button_selector = 'button[class*="Button install-module__button--"]';
    console.log("await window.click [data-waiting=false]");
    await window.click(install_button_selector.concat("[data-waiting=false]"));

    // Expect extension to be listed in installed list and enabled
    console.log('await window.waitForSelector div[class*="installed-extensions-module__extensionName--"]');
    const installedExtensionName = await (
      await window.waitForSelector('div[class*="installed-extensions-module__extensionName--"]')
    ).textContent();
    expect(installedExtensionName).toBe("@freelensapp/fluxcd-extension");
    const installedExtensionState = await (
      await window.waitForSelector('div[class*="installed-extensions-module__enabled--"]')
    ).textContent();
    expect(installedExtensionState).toBe("Enabled");
    // Dismiss any notifications so a notification still in its enter animation
    // does not intercept pointer events on the elements behind it.
    console.log("dismiss notifications");
    const notificationCloseSelector =
      'i[data-testid*="close-notification-for-notification_"], div[class*="close-button-module__closeButton--"][aria-label="Close"]';
    for (let attempt = 0; attempt < 10; attempt++) {
      const closeButtons = await window.$$(notificationCloseSelector);
      if (closeButtons.length === 0) break;
      for (const closeButton of closeButtons) {
        await closeButton.click({ force: true }).catch(() => {});
      }
      await window.waitForTimeout(200);
    }
  }, 120 * 1000);

  afterAll(
    async () => {
      // Keep listeners active through cleanup to catch late shutdown errors in CI logs.
      await cleanup?.();
      window.off("console", logger);
      restoreProcessOutputHooks?.();
      expect([...errorLogs, ...processErrorLogs]).toEqual([]);
    },
    10 * 60 * 1000,
  );

  it(
    "installs an extension",
    async () => {
      expect([...errorLogs, ...processErrorLogs]).toEqual([]);
    },
    100 * 60 * 1000,
  );
});
