import { Renderer } from "@freelensapp/extensions";

const {
  Component: { Badge, getBooleanClass, getBooleanText },
} = Renderer;

export interface BadgeSuspendedProps {
  value?: boolean;
}

/**
 * Whether an object is suspended, as the `SUSPENDED` column of the `flux` CLI says it: `True` or `False`, and `-`
 * without a value. The text is that of the host's `BadgeBoolean`, and the colors are its own, inverted: `False`, not
 * suspended, in the color of `True` (success), and `True`, suspended, in the color of `False` (error), so that the
 * badge follows the theme. Freelens v2.0.0 publishes `Badge`, `getBooleanText` and `getBooleanClass`.
 */
export const BadgeSuspended = ({ value }: BadgeSuspendedProps) => (
  <Badge className={getBooleanClass(value === undefined ? undefined : !value)} label={getBooleanText(value)} />
);
