/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// The code the integration test sessions share. The sessions attach to
// Freelens started with `pnpm dev` from a freelensapp/freelens checkout, over
// the Chrome DevTools Protocol port that script opens, and drive its renderer
// with Playwright. Its name does not match `*.tests.ts`, so Vitest does not
// collect it as a test file.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { chromium } from "playwright";

import type { Browser, ConsoleMessage, Frame, Locator, Page } from "playwright";

export const extensionName = "@freelensapp/fluxcd-extension";

// The root of this checkout, installed in place and read for the manifests.
const extensionDir = path.resolve(import.meta.dirname, "..", "..");

// The CDP endpoint of Freelens dev: `pnpm dev` of Freelens starts Electron
// with `--remoteDebuggingPort 9223`.
const cdpUrl = process.env.FREELENS_CDP_URL || "http://127.0.0.1:9223";

// The log of the main process, which CDP does not carry: the output of
// `pnpm dev` of Freelens, or its `lens.log`. Without it only the renderer's
// errors are checked.
const mainLogFile = process.env.FREELENS_MAIN_LOG;

// The kind cluster the sessions run against.
export const kindClusterName = process.env.TEST_KIND_CLUSTER_NAME || "kind";

// The namespace of the test objects, created by the fixtures.
const testNamespace = "integration-tests";

// The CRDs of every kind of the extension, and the test objects.
const crdsDir = path.join(extensionDir, "integration", "fixtures", "crds");
const objectsDir = path.join(extensionDir, "integration", "fixtures", "objects");

// The package name with `@` dropped and `/` turned into `--`
// (`sanitizeExtensionName` in Freelens's `lens-extension.ts`).
const sanitizedExtensionId = extensionName.replace("@", "").replace("/", "--");

// The page that selects the namespace of the test objects: any list page of a
// namespaced kind renders the namespace filter.
const namespacePageId = "gitrepository";

const viewTimeout = { timeout: 60 * 1000 };

const ansiEscapePattern = /\u001b\[[0-9;]*m/g;

/**
 * A connection to Freelens dev, with the errors that either process logs.
 */
export interface AppSession {
  browser: Browser;
  /** The root frame's page, where the catalog, the extensions and the preferences render. */
  window: Page;
  /** The errors logged so far. */
  errors(): string[];
  /** Stops collecting errors and closes the connection; returns every error logged. */
  close(): Promise<string[]>;
}

/**
 * Whether Freelens dev answers on its CDP endpoint and the kind cluster is
 * reachable. Outside CI a session skips with a warning otherwise; in CI the
 * run fails, so that a mistake in the workflow does not turn into a silent
 * skip.
 */
export async function appReady({ cluster }: { cluster: boolean }): Promise<boolean> {
  let reason: string | undefined;

  try {
    const response = await fetch(new URL("/json/version", cdpUrl), { signal: AbortSignal.timeout(5000) });

    if (!response.ok) {
      reason = `${cdpUrl} answered ${response.status}`;
    }
  } catch (error) {
    reason = `Freelens dev does not answer on ${cdpUrl}: ${error instanceof Error ? error.message : error}`;
  }

  if (!reason && cluster) {
    if (spawnSync("kubectl", ["--context", `kind-${kindClusterName}`, "get", "--raw", "/readyz"]).status !== 0) {
      reason = `the kind cluster ${kindClusterName} is not reachable`;
    }
  }

  if (!reason) {
    return true;
  }

  if (process.env.CI) {
    throw new Error(`Cannot run the integration tests: ${reason}`);
  }

  console.warn(`Skipping the integration tests: ${reason}`);

  return false;
}

/**
 * Collects the errors of the renderer's console, of every frame, and the
 * lines of the main log written after the session started.
 */
function collectErrors(window: Page) {
  const errorLogs: string[] = [];
  let mainLogOffset = mainLogFile && fs.existsSync(mainLogFile) ? fs.statSync(mainLogFile).size : 0;

  // Chromium logs every response that is not a success as "Failed to load
  // resource", whose text has no URL, so the location of the message is added.
  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      const { url } = msg.location();
      const text = msg.text().replaceAll(ansiEscapePattern, "");
      errorLogs.push(`[renderer] ${text}${url ? ` (${url})` : ""}`);
    }
  };

  const onPageError = (error: Error) => {
    errorLogs.push(`[renderer] ${error.stack ?? error.message}`);
  };

  // A line of the main log starts with its level, in the file and on the
  // console alike, after the task prefix that turbo adds to the output of
  // `pnpm dev` when it streams it (`freelens:dev: `).
  const readMainLog = () => {
    if (!mainLogFile || !fs.existsSync(mainLogFile)) {
      return;
    }

    const size = fs.statSync(mainLogFile).size;

    // A rotated log starts again from the beginning.
    if (size < mainLogOffset) {
      mainLogOffset = 0;
    }

    if (size === mainLogOffset) {
      return;
    }

    const fd = fs.openSync(mainLogFile, "r");

    try {
      const buffer = Buffer.alloc(size - mainLogOffset);

      fs.readSync(fd, buffer, 0, buffer.length, mainLogOffset);
      mainLogOffset = size;

      for (const line of buffer.toString("utf8").split("\n")) {
        const text = line.replaceAll(ansiEscapePattern, "");

        if (/^(?:[\w@/.-]+:[\w:-]+: )?\s*error:/.test(text)) {
          errorLogs.push(`[main] ${text.trim()}`);
        }
      }
    } finally {
      fs.closeSync(fd);
    }
  };

  window.on("console", onConsole);
  window.on("pageerror", onPageError);

  return {
    errors: () => {
      readMainLog();

      return [...errorLogs];
    },
    stop: () => {
      window.off("console", onConsole);
      window.off("pageerror", onPageError);
    },
  };
}

/**
 * Connects to Freelens dev and collects the errors either process logs until
 * the session is closed. Closing a browser connected over CDP closes only the
 * connection; the app keeps running.
 */
export async function connectApp(): Promise<AppSession> {
  const browser = await chromium.connectOverCDP(cdpUrl);

  try {
    const window = await rootPage(browser);
    const collector = collectErrors(window);

    return {
      browser,
      window,
      errors: collector.errors,
      close: async () => {
        const errors = collector.errors();

        collector.stop();
        await browser.close();

        return errors;
      },
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

/**
 * The page of the root frame: `https://renderer.freelens.app`, on the port of
 * the app's proxy. A cluster renders in an iframe of it, on
 * `<clusterId>.renderer.freelens.app`.
 */
async function rootPage(browser: Browser): Promise<Page> {
  const deadline = Date.now() + viewTimeout.timeout;

  while (Date.now() < deadline) {
    const page = browser
      .contexts()
      .flatMap((context) => context.pages())
      .find((page) => URL.canParse(page.url()) && new URL(page.url()).hostname === "renderer.freelens.app");

    if (page) {
      await page.waitForFunction(() => globalThis.FreelensExtensionApi?.Renderer !== undefined, null, viewTimeout);

      return page;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`No Freelens window on ${cdpUrl}`);
}

/**
 * Navigates the root frame with `Renderer.Navigation.navigate` of the
 * extension API: the application menu, which the packaged-app tests click,
 * belongs to the main process, which CDP does not reach.
 */
async function navigate(window: Page, url: string) {
  console.log(`navigate to ${url}`);
  await window.evaluate((url) => {
    const renderer = globalThis.FreelensExtensionApi.Renderer;

    if (!renderer) {
      throw new Error("The page has no Renderer API");
    }

    renderer.Navigation.navigate(url);
  }, url);
}

/**
 * Dismisses the notifications, so that one still in its enter animation does
 * not intercept pointer events on the elements behind it.
 */
async function dismissNotifications(window: Page) {
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
}

/**
 * Uninstalls the extension from the Extensions page, from wherever it was
 * installed. An extension installed in place is forgotten, its directory
 * stays.
 */
async function uninstallExtension(window: Page, row: Locator) {
  console.log(`uninstall ${extensionName}`);
  await row.locator('[id^="menu-actions-for-installed-extensions-for-"]').click();
  await window.locator(".MenuActions .MenuItem").getByText("Uninstall", { exact: true }).click();
  await window.getByTestId("confirmation-dialog").getByTestId("confirm").click();
  await row.waitFor({ state: "detached", ...viewTimeout });
}

/**
 * Installs this checkout in place from the Extensions page and waits until it
 * is enabled. An installation of the checkout that is already enabled is
 * kept, unless `reinstall` is set; any other installation of the extension is
 * uninstalled first.
 */
export async function installExtension({ window }: AppSession, { reinstall = false } = {}) {
  await navigate(window, "/extensions");

  const table = window.getByTestId("extensions-table");
  const row = table.locator("tbody tr", { hasText: extensionName });
  const enabled = row.locator("td").nth(2).getByText("Enabled", { exact: true });

  // Once the extensions are discovered, the page shows the table, or a notice
  // in its place when no extension is installed, as in a fresh profile.
  await table.or(window.getByText("There are no extensions installed.", { exact: true })).waitFor(viewTimeout);

  if (await row.count()) {
    const inPlace = await row.locator(`[title="Loaded in place from ${extensionDir}"]`).count();

    if (!reinstall && inPlace && (await enabled.count())) {
      console.log(`${extensionName} is installed from ${extensionDir}`);

      return;
    }

    await uninstallExtension(window, row);
  }

  console.log(`install ${extensionDir}`);
  await window.getByPlaceholder("Name, URL, or path to a package or directory").fill(extensionDir);
  await window.getByRole("button", { name: "Install", exact: true }).click();

  // A directory is loaded in place only after a confirmation.
  await window.getByTestId("confirmation-dialog").getByTestId("confirm").click(viewTimeout);

  // The status column reads "Incompatible" if the host refuses
  // `engines.freelens`.
  await enabled.waitFor(viewTimeout);
  await dismissNotifications(window);
}

/**
 * The catalog id of the kind cluster, looked up by its name.
 */
async function kindClusterId(window: Page): Promise<string> {
  const id = await window.waitForFunction(
    (name) =>
      globalThis.FreelensExtensionApi.Renderer?.Catalog.catalogEntities
        .getItemsForApiKind("entity.k8slens.dev/v1alpha1", "KubernetesCluster")
        .find((entity) => entity.getName() === name)
        ?.getId(),
    `kind-${kindClusterName}`,
    viewTimeout,
  );

  return id.jsonValue() as Promise<string>;
}

/**
 * The phase of the kind cluster in the catalog: `connected`, `connecting`,
 * `disconnected`.
 */
async function kindClusterPhase(window: Page, id: string): Promise<string | undefined> {
  return window.evaluate(
    (id) => globalThis.FreelensExtensionApi.Renderer?.Catalog.catalogEntities.getById(id)?.status.phase,
    id,
  );
}

/**
 * Disconnects the kind cluster if it is connected, and waits until it is
 * disconnected. The app reads which versions of a CRD are served when it
 * connects, so a session that changes the CRDs starts and ends with a
 * disconnected cluster. Only the kind cluster is touched; the app may have
 * others.
 */
export async function disconnectKindCluster({ window }: AppSession) {
  const id = await kindClusterId(window);

  if ((await kindClusterPhase(window, id)) === "disconnected") {
    return;
  }

  console.log(`disconnect kind-${kindClusterName}`);
  await navigate(window, "/catalog");
  await window.evaluate(async (id) => {
    const entity = globalThis.FreelensExtensionApi.Renderer?.Catalog.catalogEntities.getById(id);

    if (!entity || !("disconnect" in entity) || typeof entity.disconnect !== "function") {
      throw new Error(`The catalog has no cluster ${id}`);
    }

    await entity.disconnect();
  }, id);
  await window.waitForFunction(
    (id) =>
      globalThis.FreelensExtensionApi.Renderer?.Catalog.catalogEntities.getById(id)?.status.phase === "disconnected",
    id,
    viewTimeout,
  );
}

/**
 * Connects the kind cluster, selects the namespace of the test objects, and
 * returns the cluster's frame, where the extension's pages, details and menus
 * render.
 */
export async function openKindCluster({ window }: AppSession): Promise<Frame> {
  const id = await kindClusterId(window);

  await navigate(window, `/cluster/${id}`);

  const element = await window.waitForSelector(`#cluster-frame-${id}`, viewTimeout);
  const frame = await element.contentFrame();

  if (!frame) {
    throw new Error(`No iframe for kind-${kindClusterName}`);
  }

  await frame.waitForSelector("[data-testid=cluster-sidebar]", viewTimeout);
  await selectTestNamespace(frame);

  return frame;
}

/**
 * Opens a page of the extension in the cluster frame, by its page id, the `id`
 * of its `clusterPages` registration. The sidebar entries of the kinds are
 * nested under a group that the sidebar renders collapsed, so the frame is
 * navigated with `Renderer.Navigation.navigate` of the extension API instead.
 */
export async function openPage(frame: Frame, pageId: string) {
  const url = `/extension/${sanitizedExtensionId}/${pageId}`;

  console.log(`navigate the cluster frame to ${url}`);
  await frame.evaluate((url) => {
    const renderer = globalThis.FreelensExtensionApi.Renderer;

    if (!renderer) {
      throw new Error("The cluster frame has no Renderer API");
    }

    renderer.Navigation.navigate(url);
  }, url);
}

/**
 * Selects the namespace of the test objects in the namespace filter of a page
 * of the extension, which its `KubeObjectListLayout` renders for a namespaced
 * resource. The selection holds for every namespaced list of the cluster, and
 * the app keeps it, so it is made only when the filter shows another one. The
 * session opens no page of the host, whose requests can log errors of their
 * own: the Pods page asks for pod metrics, and kind has no metrics server.
 */
async function selectTestNamespace(frame: Frame) {
  await openPage(frame, namespacePageId);

  const label = frame.locator(".NamespaceSelect").getByText(`Namespace: ${testNamespace}`, { exact: true });
  const namespaceSelect = await frame.waitForSelector(".NamespaceSelect", viewTimeout);

  if (await label.count()) {
    return;
  }

  console.log(`select namespace ${testNamespace}`);
  await namespaceSelect.click();
  await namespaceSelect.type(testNamespace);
  await namespaceSelect.press("Enter");
  await namespaceSelect.click();
  await label.waitFor(viewTimeout);
}

/**
 * Runs kubectl against the kind cluster, never the current context, and fails
 * with its stderr when it exits non-zero.
 */
function kubectl(...args: string[]): string {
  const argv = ["--context", `kind-${kindClusterName}`, ...args];
  const command = `kubectl ${argv.join(" ")}`;

  console.log(command);

  const { error, status, signal, stdout, stderr } = spawnSync("kubectl", argv, {
    encoding: "utf8",
    timeout: 5 * 60 * 1000,
  });

  if (error) {
    throw new Error(`${command} failed: ${error.message}`);
  }

  if (status !== 0) {
    throw new Error(`${command} exited with ${status ?? signal}: ${stderr.trim()}`);
  }

  if (stdout.trim()) {
    console.log(stdout.trim());
  }

  return stdout;
}

/**
 * Removes what an earlier run left, then applies the CRDs and, once they are
 * established, the test objects.
 */
export function setUpCluster() {
  kubectl("delete", "namespace", testNamespace, "--ignore-not-found", "--wait");
  kubectl("delete", "-k", crdsDir, "--ignore-not-found", "--wait");

  // `kubectl wait` takes no kustomization, so it waits for the CRDs by the
  // names that the apply prints.
  const crds = kubectl("apply", "-k", crdsDir, "-o", "name").trim().split("\n");

  kubectl("wait", "--for=condition=Established", ...crds, "--timeout=120s");
  kubectl("apply", "-k", objectsDir);
}

/**
 * Deletes the test objects and the CRDs.
 */
export function tearDownCluster() {
  try {
    kubectl("delete", "-k", objectsDir, "--ignore-not-found", "--wait");
  } finally {
    kubectl("delete", "-k", crdsDir, "--ignore-not-found", "--wait");
  }
}

/**
 * Closes the details drawer if it is open: a click on a row toggles it.
 */
async function closeDetails(frame: Frame) {
  const details = frame.locator(".KubeObjectDetails");

  if (await details.isVisible()) {
    await frame.locator("body").press("Escape");
    await details.waitFor({ state: "hidden", ...viewTimeout });
  }
}

/**
 * Throws when the extension's error boundary rendered its error page inside
 * the locator.
 */
async function expectNoErrorPage(locator: Locator, where: string) {
  // The class of `ErrorPage`, as CSS modules name it in the bundle.
  const errorPages = await locator.locator('[class*="_errorPage_"]').count();

  if (errorPages > 0) {
    throw new Error(`${where} shows ${errorPages} error page(s) of the extension`);
  }
}

/**
 * Opens the Overview page of the extension and waits for the title of the
 * kind's chart with the number of its objects, such as `Git Repositories (1)`,
 * after checking that the page rendered no error page.
 */
export async function openOverview(frame: Frame, chartTitle: string, count: number) {
  await openPage(frame, "dashboard");
  await closeDetails(frame);
  await frame.getByText(`${chartTitle} (${count})`, { exact: true }).waitFor(viewTimeout);
  await expectNoErrorPage(frame.locator("main"), "The Overview");
}

/**
 * Opens a list page of the extension and returns the table row of the object.
 */
export async function openListPage(frame: Frame, pageId: string, name: string): Promise<Locator> {
  await openPage(frame, pageId);
  await closeDetails(frame);

  const row = frame.locator(".TableRow").filter({ has: frame.locator(".TableCell").getByText(name, { exact: true }) });

  await row.waitFor(viewTimeout);

  return row;
}

/**
 * Opens the details of the row's object and waits for an item of the
 * extension's details panel, after checking that the extension's error
 * boundary rendered no error page in the drawer.
 */
export async function openDetails(frame: Frame, row: Locator, name: string, itemName: string) {
  // The name is the first cell after the checkbox; a reference in another
  // column, such as the source of an ExternalArtifact, can have the same name.
  await row.locator(".TableCell:not(.checkbox)").first().getByText(name, { exact: true }).click();

  const details = frame.locator(".KubeObjectDetails");

  await details.locator(".DrawerItem .name").getByText(itemName, { exact: true }).first().waitFor(viewTimeout);
  await expectNoErrorPage(details, "The details drawer");
}

/**
 * Opens the context menu of the row and returns the menu, which the host
 * renders outside the row.
 */
export async function openRowMenu(frame: Frame, row: Locator): Promise<Locator> {
  const trigger = row.locator('.TableCell.menu [data-testid^="icon-for-menu-actions-for-kube-object-menu-for-"]');
  const triggerTestId = await trigger.getAttribute("data-testid", viewTimeout);

  if (!triggerTestId) {
    throw new Error("The row has no menu");
  }

  await trigger.click();

  const menu = frame.getByTestId(triggerTestId.replace(/^icon-for-/, ""));

  await menu.waitFor(viewTimeout);

  return menu;
}

/**
 * Waits for the item of the menu with the title.
 */
export async function waitForMenuItem(menu: Locator, title: string) {
  await menu.locator(".MenuItem .title").getByText(title, { exact: true }).waitFor(viewTimeout);
}

/**
 * The titles of the menu's items: the host's own, such as Edit and Delete,
 * and the extension's.
 */
export async function menuItemTitles(menu: Locator): Promise<string[]> {
  // The host's items are rendered with the extension's, once the menu is open.
  await menu.locator(".MenuItem .title").first().waitFor(viewTimeout);

  return menu.locator(".MenuItem .title").allTextContents();
}
