import { Common, Renderer } from "@freelensapp/extensions";
import { getMaybeDetailsUrl } from "../utils";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { MaybeLink, WithTooltip },
  K8sApi: { serviceAccountsApi },
} = Renderer;

interface LinkToServiceAccountProps {
  name?: string;
  namespace?: string;
}

export function LinkToServiceAccount({ name, namespace }: LinkToServiceAccountProps) {
  if (!name || !namespace) return null;
  return (
    <MaybeLink
      key="link"
      to={getMaybeDetailsUrl(
        serviceAccountsApi.formatUrlForNotListing({
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
