import React, { useEffect, useState } from "react";
import { formatDuration } from "../../utils";

export function KubeAge(props: { timestamp: number }): React.ReactElement {
  const getAge = (ts: number): string => {
    const diff = Date.now() - new Date(ts).getTime();
    return formatDuration(diff, true);
  };

  const [age, setAge] = useState(getAge(props.timestamp));

  useEffect(() => {
    const timeout = setInterval(() => {
      setAge(getAge(props.timestamp));
    }, 1000);

    return () => {
      clearInterval(timeout as unknown as string);
    };
  }, []);

  return <>{age}</>;
}
