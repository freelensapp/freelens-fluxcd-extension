/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@freelensapp/extensions";

const {
  Component: { LocaleDate, ReactiveDuration },
} = Renderer;

export interface DurationAbsoluteTimestampProps {
  timestamp: string | undefined;
}

export const DurationAbsoluteTimestamp = ({ timestamp }: DurationAbsoluteTimestampProps) => {
  if (!timestamp) {
    return <>{"<unknown>"}</>;
  }

  return (
    <>
      <ReactiveDuration timestamp={timestamp} />
      {" ago "}
      (
      <LocaleDate date={timestamp} />)
    </>
  );
};
