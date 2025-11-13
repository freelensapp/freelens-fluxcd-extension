import { Common, Renderer } from "@freelensapp/extensions";
import { ResourceSetInputProvider } from "../k8s/fluxcd/controlplane/resourcesetinputprovider-v1";
import { getMaybeDetailsUrl } from "../utils";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { MaybeLink, WithTooltip },
} = Renderer;

interface LinkToResourceSetInputProviderProps {
  name?: string;
  namespace?: string;
}

export function LinkToResourceSetInputProvider({ name, namespace }: LinkToResourceSetInputProviderProps) {
  if (!name || !namespace) return null;

  // try {
  const resourceSetInputProviderApi = ResourceSetInputProvider.getApi<ResourceSetInputProvider>();

  return (
    <MaybeLink
      key="link"
      to={getMaybeDetailsUrl(
        resourceSetInputProviderApi.formatUrlForNotListing({
          name,
          namespace,
        }),
      )}
      onClick={stopPropagation}
    >
      <WithTooltip>{name}</WithTooltip>
    </MaybeLink>
  );
  // } catch {
  //   return null;
  // }
}
