import { Common, Renderer } from "@freelensapp/extensions";
import { getMaybeDetailsUrl } from "../utils";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { MaybeLink, WithTooltip },
  K8sApi: { namespacesApi },
} = Renderer;

interface LinkToNamespaceProps {
  namespace?: string;
}

export function LinkToNamespace({ namespace }: LinkToNamespaceProps) {
  if (!namespace) return null;
  return (
    <MaybeLink
      key="link"
      to={getMaybeDetailsUrl(
        namespacesApi.formatUrlForNotListing({
          name: namespace,
        }),
      )}
      onClick={stopPropagation}
    >
      <WithTooltip>{namespace}</WithTooltip>
    </MaybeLink>
  );
}
