import { Common, Renderer } from "@freelensapp/extensions";

const { bytesToUnits, unitsToBytes } = Common.Util;

const {
  Component: { WithTooltip },
} = Renderer;

interface HumanizeBytesProps {
  value?: string | number | null;
}

export function HumanizeBytes({ value }: HumanizeBytesProps) {
  if (value === undefined || value === null) return null;
  const stringValue = typeof value === "number" ? value.toString() : value;
  const newValue = bytesToUnits(unitsToBytes(stringValue));
  if (newValue !== "N/A") {
    const tooltip = stringValue;
    const displayValue = newValue;
    return <WithTooltip tooltip={tooltip}>{displayValue}</WithTooltip>;
  }
  return <>{stringValue}</>;
}
