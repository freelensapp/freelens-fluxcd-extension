import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";

import type {
  Install,
  InstallRemediation,
  Rollback,
  Test,
  Uninstall,
  Upgrade,
  UpgradeRemediation,
} from "../../../k8s/fluxcd/helm/helmrelease-v2";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle },
} = Renderer;

// The sections of the Helm actions of a HelmRelease `v2`. A section is shown only when its struct is set in the spec,
// and in it an item only when its field is set: most fields are booleans that default to `false`, or timeouts that
// default to `spec.timeout`. A default is shown only where the API documents one that is not obvious.

/** `Retries` of a remediation: `0` by default, and a negative number for unlimited retries. */
const getRetriesText = (retries = 0) => (retries < 0 ? `${retries} (unlimited)` : `${retries}`);

const InstallRemediationItem = ({ remediation }: { remediation?: InstallRemediation }) => (
  <DrawerItem name="Remediation" hidden={!remediation}>
    <DrawerItem name="Retries">{getRetriesText(remediation?.retries)}</DrawerItem>
    <DrawerItem name="Ignore Test Failures" hidden={remediation?.ignoreTestFailures === undefined}>
      <BadgeBoolean value={remediation?.ignoreTestFailures ?? false} />
    </DrawerItem>
    <DrawerItem name="Remediate Last Failure">
      <BadgeBoolean value={remediation?.remediateLastFailure ?? false} />
    </DrawerItem>
    {/* `InstallRemediation` has no strategy: a failed install is always uninstalled (`GetStrategy`). */}
    <DrawerItem name="Strategy">uninstall</DrawerItem>
  </DrawerItem>
);

const UpgradeRemediationItem = ({ remediation }: { remediation?: UpgradeRemediation }) => (
  <DrawerItem name="Remediation" hidden={!remediation}>
    <DrawerItem name="Retries">{getRetriesText(remediation?.retries)}</DrawerItem>
    <DrawerItem name="Ignore Test Failures" hidden={remediation?.ignoreTestFailures === undefined}>
      <BadgeBoolean value={remediation?.ignoreTestFailures ?? false} />
    </DrawerItem>
    {/* `false` by default, unless `retries` is greater than 0 (`MustRemediateLastFailure`). */}
    <DrawerItem name="Remediate Last Failure">
      <BadgeBoolean value={remediation?.remediateLastFailure ?? (remediation?.retries ?? 0) > 0} />
    </DrawerItem>
    <DrawerItem name="Strategy">{remediation?.strategy ?? "rollback"}</DrawerItem>
  </DrawerItem>
);

export const HelmReleaseInstall = observer(({ install }: { install?: Install }) => {
  if (!install) return null;

  return (
    <div>
      <DrawerTitle>Install</DrawerTitle>
      <DrawerItem name="Timeout" hidden={!install.timeout}>
        {install.timeout}
      </DrawerItem>
      <DrawerItem name="Strategy" hidden={!install.strategy}>
        {install.strategy?.name}
        {install.strategy?.retryInterval && ` (retry interval: ${install.strategy.retryInterval})`}
      </DrawerItem>
      <InstallRemediationItem remediation={install.remediation} />
      <DrawerItem name="CRDs" hidden={!install.crds}>
        {install.crds}
      </DrawerItem>
      <DrawerItem name="Skip CRDs" hidden={!install.skipCRDs}>
        <BadgeBoolean value={install.skipCRDs ?? false} />
      </DrawerItem>
      <DrawerItem name="Server-Side Apply" hidden={install.serverSideApply === undefined}>
        <BadgeBoolean value={install.serverSideApply ?? false} />
      </DrawerItem>
      <DrawerItem name="Create Namespace" hidden={!install.createNamespace}>
        <BadgeBoolean value={install.createNamespace ?? false} />
      </DrawerItem>
      <DrawerItem name="Replace" hidden={!install.replace}>
        <BadgeBoolean value={install.replace ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Take Ownership" hidden={!install.disableTakeOwnership}>
        <BadgeBoolean value={install.disableTakeOwnership ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Wait" hidden={!install.disableWait}>
        <BadgeBoolean value={install.disableWait ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Wait For Jobs" hidden={!install.disableWaitForJobs}>
        <BadgeBoolean value={install.disableWaitForJobs ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Hooks" hidden={!install.disableHooks}>
        <BadgeBoolean value={install.disableHooks ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable OpenAPI Validation" hidden={!install.disableOpenAPIValidation}>
        <BadgeBoolean value={install.disableOpenAPIValidation ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Schema Validation" hidden={!install.disableSchemaValidation}>
        <BadgeBoolean value={install.disableSchemaValidation ?? false} />
      </DrawerItem>
    </div>
  );
});

export const HelmReleaseUpgrade = observer(({ upgrade }: { upgrade?: Upgrade }) => {
  if (!upgrade) return null;

  return (
    <div>
      <DrawerTitle>Upgrade</DrawerTitle>
      <DrawerItem name="Timeout" hidden={!upgrade.timeout}>
        {upgrade.timeout}
      </DrawerItem>
      <DrawerItem name="Strategy" hidden={!upgrade.strategy}>
        {upgrade.strategy?.name}
        {upgrade.strategy?.retryInterval && ` (retry interval: ${upgrade.strategy.retryInterval})`}
      </DrawerItem>
      <UpgradeRemediationItem remediation={upgrade.remediation} />
      <DrawerItem name="CRDs" hidden={!upgrade.crds}>
        {upgrade.crds}
      </DrawerItem>
      <DrawerItem name="Server-Side Apply" hidden={!upgrade.serverSideApply}>
        {upgrade.serverSideApply}
      </DrawerItem>
      <DrawerItem name="Chart Name Change Strategy" hidden={!upgrade.chartNameChangeStrategy}>
        {upgrade.chartNameChangeStrategy}
      </DrawerItem>
      <DrawerItem name="Force" hidden={!upgrade.force}>
        <BadgeBoolean value={upgrade.force ?? false} />
      </DrawerItem>
      <DrawerItem name="Preserve Values" hidden={!upgrade.preserveValues}>
        <BadgeBoolean value={upgrade.preserveValues ?? false} />
      </DrawerItem>
      <DrawerItem name="Cleanup On Fail" hidden={!upgrade.cleanupOnFail}>
        <BadgeBoolean value={upgrade.cleanupOnFail ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Take Ownership" hidden={!upgrade.disableTakeOwnership}>
        <BadgeBoolean value={upgrade.disableTakeOwnership ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Wait" hidden={!upgrade.disableWait}>
        <BadgeBoolean value={upgrade.disableWait ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Wait For Jobs" hidden={!upgrade.disableWaitForJobs}>
        <BadgeBoolean value={upgrade.disableWaitForJobs ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Hooks" hidden={!upgrade.disableHooks}>
        <BadgeBoolean value={upgrade.disableHooks ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable OpenAPI Validation" hidden={!upgrade.disableOpenAPIValidation}>
        <BadgeBoolean value={upgrade.disableOpenAPIValidation ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Schema Validation" hidden={!upgrade.disableSchemaValidation}>
        <BadgeBoolean value={upgrade.disableSchemaValidation ?? false} />
      </DrawerItem>
    </div>
  );
});

export const HelmReleaseRollback = observer(({ rollback }: { rollback?: Rollback }) => {
  if (!rollback) return null;

  return (
    <div>
      <DrawerTitle>Rollback</DrawerTitle>
      <DrawerItem name="Timeout" hidden={!rollback.timeout}>
        {rollback.timeout}
      </DrawerItem>
      <DrawerItem name="Server-Side Apply" hidden={!rollback.serverSideApply}>
        {rollback.serverSideApply}
      </DrawerItem>
      <DrawerItem name="Force" hidden={!rollback.force}>
        <BadgeBoolean value={rollback.force ?? false} />
      </DrawerItem>
      <DrawerItem name="Recreate" hidden={!rollback.recreate}>
        <BadgeBoolean value={rollback.recreate ?? false} />
      </DrawerItem>
      <DrawerItem name="Cleanup On Fail" hidden={!rollback.cleanupOnFail}>
        <BadgeBoolean value={rollback.cleanupOnFail ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Wait" hidden={!rollback.disableWait}>
        <BadgeBoolean value={rollback.disableWait ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Wait For Jobs" hidden={!rollback.disableWaitForJobs}>
        <BadgeBoolean value={rollback.disableWaitForJobs ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Hooks" hidden={!rollback.disableHooks}>
        <BadgeBoolean value={rollback.disableHooks ?? false} />
      </DrawerItem>
    </div>
  );
});

export const HelmReleaseTest = observer(({ test }: { test?: Test }) => {
  if (!test) return null;

  return (
    <div>
      <DrawerTitle>Test</DrawerTitle>
      <DrawerItem name="Enabled">
        <BadgeBoolean value={test.enable ?? false} />
      </DrawerItem>
      <DrawerItem name="Timeout" hidden={!test.timeout}>
        {test.timeout}
      </DrawerItem>
      <DrawerItem name="Ignore Failures" hidden={!test.ignoreFailures}>
        <BadgeBoolean value={test.ignoreFailures ?? false} />
      </DrawerItem>
      <DrawerItem name="Filters" hidden={!test.filters?.length}>
        {test.filters?.map((filter) => (
          <DrawerItem name={filter.name} key={filter.name}>
            {filter.exclude ? "exclude" : "run"}
          </DrawerItem>
        ))}
      </DrawerItem>
    </div>
  );
});

export const HelmReleaseUninstall = observer(({ uninstall }: { uninstall?: Uninstall }) => {
  if (!uninstall) return null;

  return (
    <div>
      <DrawerTitle>Uninstall</DrawerTitle>
      <DrawerItem name="Timeout" hidden={!uninstall.timeout}>
        {uninstall.timeout}
      </DrawerItem>
      <DrawerItem name="Deletion Propagation">{uninstall.deletionPropagation ?? "background"}</DrawerItem>
      <DrawerItem name="Keep History" hidden={!uninstall.keepHistory}>
        <BadgeBoolean value={uninstall.keepHistory ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Wait" hidden={!uninstall.disableWait}>
        <BadgeBoolean value={uninstall.disableWait ?? false} />
      </DrawerItem>
      <DrawerItem name="Disable Hooks" hidden={!uninstall.disableHooks}>
        <BadgeBoolean value={uninstall.disableHooks ?? false} />
      </DrawerItem>
    </div>
  );
});
