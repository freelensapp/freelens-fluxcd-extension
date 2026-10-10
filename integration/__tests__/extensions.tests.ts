/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Runs inside a Freelens checkout, copied into `freelens/integration/__tests__/`
// by the integration tests workflow, and imports the helpers found there.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as utils from "../helpers/utils";

import type { ConsoleMessage, ElectronApplication, Page } from "playwright";

const extensionName = "@freelensapp/fluxcd-extension";

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

    // Trigger extension install: the packed tarball from the workflow, or the
    // published package when the test runs without one.
    console.log("await textbox.fill");
    await window
      .getByPlaceholder("Name, URL, or path to a package or directory")
      .fill(process.env.EXTENSION_PATH || extensionName);
    console.log("await install button click");
    await window.getByRole("button", { name: "Install", exact: true }).click();

    // Expect extension to be listed in installed list and enabled. The status
    // column reads "Incompatible" if the host refuses `engines.freelens`.
    console.log("await extensions table row");
    const row = window.getByTestId("extensions-table").locator("tbody tr", { hasText: extensionName });
    await row.locator("td").nth(2).getByText("Enabled", { exact: true }).waitFor();

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
