import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import React from "react";
import { ImageUpdateAutomation } from "../../../k8s/fluxcd/image/imageupdateautomation-v1";
import { GitRepository } from "../../../k8s/fluxcd/source/gitrepository-v1";
import { withServedApiVersion } from "../../../k8s/fluxcd/utils";
import { getHeight } from "../../../utils";
import styles from "./image-update-automation-details.module.scss";

const { observer } = MobxReact;

const {
  Component: {
    Badge,
    BadgeBoolean,
    DrawerItem,
    DrawerItemLabels,
    DrawerTitle,
    DurationAbsoluteTimestamp,
    Icon,
    LinkToObject,
    LinkToSecret,
    MonacoEditor,
  },
} = Renderer;

export const ImageUpdateAutomationDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<ImageUpdateAutomation>> =
  observer((props) => {
    const { object } = props;

    const namespace = object.getNs();
    const gitRefFull = GitRepository.getGitRefFull(object.spec.git?.checkout?.ref);
    const policySelector = object.spec.policySelector;
    const signingKey = object.spec.git?.commit.signingKey;

    return (
      <>
        <div className={styles.details}>
          <DrawerItem name="Resumed">
            <BadgeBoolean value={!object.spec.suspend} />
          </DrawerItem>
          <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
          <DrawerItem name="Policy Change Delay" hidden={!object.spec.policyChangeDelay}>
            {object.spec.policyChangeDelay}
          </DrawerItem>
          <DrawerItem name="Policy Selector" hidden={!policySelector}>
            <DrawerItemLabels
              name="Match Labels"
              labels={policySelector?.matchLabels ?? {}}
              hidden={!policySelector?.matchLabels}
            />
            <DrawerItem name="Match Expressions" hidden={!policySelector?.matchExpressions?.length}>
              {policySelector?.matchExpressions?.map((expr) => (
                <div key={Renderer.Util.createReactKey(expr)}>
                  <DrawerItem name="Key">{expr.key}</DrawerItem>
                  <DrawerItem name="Operator">{expr.operator}</DrawerItem>
                  <DrawerItem name="Values" hidden={!expr.values?.length}>
                    {expr.values?.map((value) => (
                      <Badge key={value} label={value} />
                    ))}
                  </DrawerItem>
                </div>
              ))}
            </DrawerItem>
          </DrawerItem>
          <DrawerItem name="Git Repository">
            <LinkToObject objectRef={withServedApiVersion(object.spec.sourceRef)} object={object} />
          </DrawerItem>
          <DrawerItem name="Git Ref" hidden={!gitRefFull}>
            {gitRefFull}
          </DrawerItem>
          <DrawerItem name="Commit Author" hidden={!object.spec.git?.commit.author}>
            {ImageUpdateAutomation.getCommitAuthor(object)}
          </DrawerItem>
          <DrawerItem name="Signing Key" hidden={!signingKey}>
            <LinkToSecret name={signingKey?.secretRef.name} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="Signing Key Type" hidden={!signingKey}>
            {signingKey?.type || "gpg"}
          </DrawerItem>
          <DrawerItem name="Message Template" hidden={!object.spec.git?.commit.messageTemplate}>
            <MonacoEditor
              readOnly
              id="ignore"
              className={styles.editor}
              style={{
                minHeight: getHeight(object.spec.git?.commit.messageTemplate ?? ""),
              }}
              value={object.spec.git?.commit.messageTemplate ?? ""}
              setInitialHeight
              options={{
                scrollbar: {
                  alwaysConsumeMouseWheel: false,
                },
              }}
              language={"handlebars" as any}
            />
          </DrawerItem>
          <DrawerItemLabels
            name="Message Template Values"
            labels={object.spec.git?.commit.messageTemplateValues ?? {}}
            hidden={!object.spec.git?.commit.messageTemplateValues}
          />

          <DrawerTitle>Push Specification</DrawerTitle>
          <DrawerItem name="Branch" hidden={!object.spec.git?.push?.branch}>
            {object.spec.git?.push?.branch}
          </DrawerItem>
          <DrawerItem name="Git Refspec" hidden={!object.spec.git?.push?.refspec}>
            {object.spec.git?.push?.refspec}
          </DrawerItem>
          <DrawerItem name="Options" hidden={!object.spec.git?.push?.options}>
            {Object.entries(object.spec.git?.push?.options ?? {}).map(([key, value]) => (
              <DrawerItem key={key} name={key}>
                {value}
              </DrawerItem>
            ))}
          </DrawerItem>

          {object.spec.update && (
            <>
              <DrawerTitle>Update Strategy</DrawerTitle>
              <DrawerItem name="Strategy">{object.spec.update.strategy ?? "Setters"}</DrawerItem>
              <DrawerItem name="Path">{object.spec.update.path}</DrawerItem>
            </>
          )}

          {object.status && (
            <>
              <DrawerTitle>Status</DrawerTitle>
              <DrawerItem name="Last Automation Run" hidden={!object.status.lastAutomationRunTime}>
                <DurationAbsoluteTimestamp timestamp={object.status.lastAutomationRunTime} />
              </DrawerItem>
              <DrawerItem name="Last Push Commit" hidden={!object.status.lastPushCommit}>
                {object.status.lastPushCommit}
              </DrawerItem>
              <DrawerItem name="Last Push Time" hidden={!object.status.lastPushTime}>
                <DurationAbsoluteTimestamp timestamp={object.status.lastPushTime} />
              </DrawerItem>
              <DrawerItem name="Observed Source Revision" hidden={!object.status.observedSourceRevision}>
                {object.status.observedSourceRevision}
              </DrawerItem>
            </>
          )}

          {object?.status?.observedPolicies && (
            <>
              <DrawerTitle>Observed Policies</DrawerTitle>
              {Object.entries(object.status.observedPolicies ?? {}).map(([key, value]) => (
                <div key={key}>
                  <div className={styles.title}>
                    <Icon small material="list" />
                    <span>{key}</span>
                  </div>
                  <DrawerItem name="Name">{value.name}</DrawerItem>
                  <DrawerItem name="Tag">{value.tag}</DrawerItem>
                  <DrawerItem name="Digest" hidden={!value.digest}>
                    {value.digest}
                  </DrawerItem>
                </div>
              ))}
            </>
          )}
        </div>
      </>
    );
  });
