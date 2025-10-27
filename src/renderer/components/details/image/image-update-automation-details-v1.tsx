import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import React from "react";
import { ImageUpdateAutomation } from "../../../k8s/fluxcd/image/imageupdateautomation-v1";
import { GitRepository } from "../../../k8s/fluxcd/source/gitrepository-v1";
import { getHeight } from "../../../utils";
import { LinkToObject } from "../../link-to-object";
import { LinkToSecret } from "../../link-to-secret";
import styles from "./image-update-automation-details.module.scss";
import stylesInline from "./image-update-automation-details.module.scss?inline";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, Icon, MonacoEditor },
} = Renderer;

export const ImageUpdateAutomationDetails: React.FC<Renderer.Component.KubeObjectDetailsProps<ImageUpdateAutomation>> =
  observer((props) => {
    const { object } = props;

    const namespace = object.getNs();
    const gitRefFull = GitRepository.getGitRefFull(object.spec.git?.checkout?.ref);

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.details}>
          <DrawerItem name="Resumed">
            <BadgeBoolean value={!object.spec.suspend} />
          </DrawerItem>
          <DrawerItem name="Interval">{object.spec.interval}</DrawerItem>
          <DrawerItem name="Git Repository">
            <LinkToObject objectRef={object.spec.sourceRef} object={object} />
          </DrawerItem>
          <DrawerItem name="Git Ref" hidden={!gitRefFull}>
            {gitRefFull}
          </DrawerItem>
          <DrawerItem name="Commit Author" hidden={!object.spec.git?.commit?.author}>
            {ImageUpdateAutomation.getCommitAuthor(object)}
          </DrawerItem>
          <DrawerItem name="Signing Key" hidden={!object.spec.git?.commit?.signingKey}>
            <LinkToSecret name={object.spec.git?.commit?.signingKey?.secretRef?.name} namespace={namespace} />
          </DrawerItem>
          <DrawerItem name="Message Template" hidden={!object.spec.git?.commit?.messageTemplate}>
            <MonacoEditor
              readOnly
              id="ignore"
              className={styles.editor}
              style={{
                minHeight: getHeight(object.spec.git?.commit?.messageTemplate ?? ""),
              }}
              value={object.spec.git?.commit?.messageTemplate ?? ""}
              setInitialHeight
              options={{
                scrollbar: {
                  alwaysConsumeMouseWheel: false,
                },
              }}
              language={"handlebars" as any}
            />
          </DrawerItem>

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
              <DrawerItem name="Strategy">{object.spec.update.strategy}</DrawerItem>
              <DrawerItem name="Path">{object.spec.update.path}</DrawerItem>
            </>
          )}

          {object?.status?.observedPolicies && (
            <>
              <DrawerTitle>Observed Policies</DrawerTitle>
              {Object.entries(object.status.observedPolicies ?? {}).map(([key, value]) => (
                <>
                  <div>
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
                </>
              ))}
            </>
          )}
        </div>
      </>
    );
  });
