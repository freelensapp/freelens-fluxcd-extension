import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";

const {
  Component: { LocaleDate, ReactiveDuration },
} = Renderer;

export interface TimestampAgeLocalDateProps {
  timestamp?: string;
}

export const TimestampAgeLocalDate: React.FC<TimestampAgeLocalDateProps> = observer((props) => {
  const { timestamp } = props;

  if (!timestamp) return null;

  try {
    return (
      <>
        <ReactiveDuration timestamp={timestamp} compact={false} />
        {" ago "}
        <LocaleDate date={timestamp} />
      </>
    );
  } catch (_) {
    return null;
  }
});
