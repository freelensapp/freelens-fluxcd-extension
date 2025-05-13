/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { expect } from "@jest/globals";
import type { ConsoleMessage, ElectronApplication, Page } from "playwright";
import * as utils from "../helpers/utils";

describe("extensions page tests", () => {
  let window: Page;
  let cleanup: undefined | (() => Promise<void>);

  const logger = (msg: ConsoleMessage) => console.log(msg.text());

  beforeAll(async () => {
    let app: ElectronApplication;

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
    await textbox.fill(process.env.EXTENSION_PATH || "@freelensapp/extension-fluxcd");
    const install_button_selector = 'button[class*="Button install-module__button--"]';
    console.log("await window.click [data-waiting=false]");
    await window.click(install_button_selector.concat("[data-waiting=false]"));

    // Expect extension to be listed in installed list and enabled
    console.log('await window.waitForSelector div[class*="installed-extensions-module__extensionName--"]');
    const installedExtensionName = await (
      await window.waitForSelector('div[class*="installed-extensions-module__extensionName--"]')
    ).textContent();
    expect(installedExtensionName).toBe("@freelensapp/extension-fluxcd");
    const installedExtensionState = await (
      await window.waitForSelector('div[class*="installed-extensions-module__enabled--"]')
    ).textContent();
    expect(installedExtensionState).toBe("Enabled");
    console.log('await window.click i[data-testid*="close-notification-for-notification_"]');
    await window.click('i[data-testid*="close-notification-for-notification_"]');
    console.log('await window.click div[class*=[close-button-module__closeButton--"][aria-label="Close"]');
    await window.click('div[class*="close-button-module__closeButton--"][aria-label="Close"]');
  }, 15 * 1000);

  afterAll(
    async () => {
      // Cannot log after tests are done.
      window.off("console", logger);
      await cleanup?.();
    },
    10 * 60 * 1000,
  );

  it(
    "installs an extension",
    async () => {
      // Nothing, as only beforeAll is called
    },
    100 * 60 * 1000,
  );
});
