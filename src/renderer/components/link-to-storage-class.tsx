import { Common, Renderer } from "@freelensapp/extensions";
import { getMaybeDetailsUrl } from "../utils";

const {
  Util: { stopPropagation },
} = Common;

const {
  Component: { MaybeLink, WithTooltip },
  K8sApi: { storageClassApi },
} = Renderer;

interface LinkToStorageClassProps {
  storageClassName?: string;
}

export function LinkToStorageClass({ storageClassName }: LinkToStorageClassProps) {
  if (!storageClassName) return null;
  return (
    <MaybeLink
      key="link"
      to={getMaybeDetailsUrl(
        storageClassApi.formatUrlForNotListing({
          name: storageClassName,
        }),
      )}
      onClick={stopPropagation}
    >
      <WithTooltip>{storageClassName}</WithTooltip>
    </MaybeLink>
  );
}
