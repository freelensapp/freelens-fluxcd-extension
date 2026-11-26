import { Common, Renderer } from "@freelensapp/extensions";
import { getPageId, getStats } from "./pie-chart";

import type React from "react";

type StatsObject = Parameters<typeof getStats>[0][number];

/**
 * Whether the Overview shows cards: the user chose the Cards overview style, and the host has the cards. Freelens
 * v2.0.0 publishes neither `getOverviewStyle` nor `StatusCard`, which the declaration types as always present, so
 * both are read as possibly missing, and the Overview shows the charts without them. `getOverviewStyle` is
 * observable: an `observer` that calls this renders again when the user switches.
 */
export const isOverviewStyleCards = (): boolean => {
  const preferences: Partial<typeof Common.App.Preferences> | undefined = Common.App?.Preferences;
  const statusCard: typeof Renderer.Component.StatusCard | undefined = Renderer.Component.StatusCard;
  return preferences?.getOverviewStyle?.() === "cards" && statusCard !== undefined;
};

/**
 * The statuses of a card: the categories of `getStats`, in the same order, each with a color of the theme.
 */
export const getStatusCardStatuses = (objects: StatsObject[]): Renderer.Component.StatusCardStatus[] => {
  const [ready, notReady, inProgress, suspended, unknown] = getStats(objects);

  return [
    { label: "Ready", count: ready, color: "var(--colorOk)", tone: "healthy" },
    { label: "Not Ready", count: notReady, color: "var(--colorError)", tone: "failing" },
    { label: "In progress", count: inProgress, color: "var(--colorWarning)", tone: "neutral" },
    { label: "Suspended", count: suspended, color: "var(--colorInfo)", tone: "neutral" },
    { label: "Unknown", count: unknown, color: "var(--colorVague)", tone: "neutral" },
  ];
};

export interface FluxCDStatusCardProps {
  extension: Renderer.LensExtension;
  objects: StatsObject[];
  title: string;
  crd: Renderer.K8sApi.CustomResourceDefinition;
}

/**
 * The card of a kind on the Overview, in place of its `PieChart` when the user chose the Cards overview style.
 * Only rendered where `isOverviewStyleCards()` holds, so the host has `StatusCard`.
 */
export function FluxCDStatusCard({ extension, objects, title, crd }: FluxCDStatusCardProps): React.ReactElement {
  const { StatusCard } = Renderer.Component;

  return (
    <StatusCard
      title={title}
      total={objects.length}
      statuses={getStatusCardStatuses(objects)}
      onClick={() => void extension.navigate(getPageId(crd))}
    />
  );
}
