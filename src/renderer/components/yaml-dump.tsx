import { Renderer } from "@freelensapp/extensions";
import yaml from "js-yaml";
import { observer } from "mobx-react";
import { defaultYamlDumpOptions, getHeight } from "../utils";
import styles from "./yaml-dump.module.scss";
import stylesInline from "./yaml-dump.module.scss?inline";

const {
  Component: { MonacoEditor },
} = Renderer;

export function yamlDump(data: any): string {
  return yaml.dump(data, defaultYamlDumpOptions).replace(/[\r\n]+$/, "");
}

export interface YamlDumpProps {
  data?: any;
}

export const YamlDump: React.FC<YamlDumpProps> = observer((props) => {
  const { data } = props;

  const dataDump = yaml.dump(data, defaultYamlDumpOptions).replace(/[\r\n]+$/, "");

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
