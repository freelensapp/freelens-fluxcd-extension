import { Renderer } from "@freelensapp/extensions";
import { dump } from "js-yaml";
import * as MobxReact from "mobx-react";
import { defaultYamlDumpOptions, getHeight } from "../utils";
import styles from "./yaml-dump.module.scss";
import stylesInline from "./yaml-dump.module.scss?inline";

const { observer } = MobxReact;

const {
  Component: { MonacoEditor },
} = Renderer;

export function yamlDump(data: any): string {
  return dump(data, defaultYamlDumpOptions).replace(/[\r\n]+$/, "");
}

export interface YamlDumpProps {
  data?: any;
}

export const YamlDump: React.FC<YamlDumpProps> = observer((props) => {
  const { data } = props;

  const dataDump = dump(data, defaultYamlDumpOptions).replace(/[\r\n]+$/, "");

  return (
    <>
      <style>{stylesInline}</style>
      <MonacoEditor
        readOnly
        className={styles.editor}
        style={{
          minHeight: getHeight(dataDump),
        }}
        value={dataDump}
        setInitialHeight
        options={{
          scrollbar: {
            alwaysConsumeMouseWheel: false,
          },
        }}
      />
    </>
  );
});
