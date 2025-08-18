import { Common, Renderer } from "@freelensapp/extensions";
import { getMaybeDetailsUrl } from "../utils";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { MaybeLink, WithTooltip },
  K8sApi: { secretsApi },
} = Renderer;

interface LinkToSecretProps {
  name?: string;
  namespace?: string;
}

export function LinkToSecret({ name, namespace }: LinkToSecretProps) {
  if (!name || !namespace) return null;
  return (
    <MaybeLink
      key="link"
      to={getMaybeDetailsUrl(
        secretsApi.formatUrlForNotListing({
          name,
          namespace,
        }),
      )}
      onClick={stopPropagation}
    >
      <WithTooltip>{name}</WithTooltip>
    </MaybeLink>
  );
}
