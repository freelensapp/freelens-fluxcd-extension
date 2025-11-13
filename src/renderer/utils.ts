import { Renderer } from "@freelensapp/extensions";
import crypto from "crypto";

import type { DumpOptions } from "js-yaml";

const {
  Navigation: { getDetailsUrl },
} = Renderer;

export function checksum(data: any): string {
  return crypto.createHash("sha256").update(JSON.stringify(data)).digest("hex").substring(0, 16);
}

export function getMaybeDetailsUrl(url?: string): string {
  if (url) {
    return getDetailsUrl(url);
  } else {
    return "";
  }
}

export function getHeight(data?: string): number {
  const lineHeight = 18;
  if (!data) return lineHeight;

  const lines = data.split("\n").length;
  if (lines < 5) return 5 * lineHeight;
  if (lines > 20) return 20 * lineHeight;
  return lines * lineHeight;
}

export const defaultYamlDumpOptions: DumpOptions = {
  noArrayIndent: true,
  noCompatMode: true,
  noRefs: true,
  quotingType: '"',
  sortKeys: true,
};

export function createEnumFromKeys<T extends Record<string, any>>(obj: T): Record<keyof T, keyof T> {
  return Object.keys(obj).reduce(
    (acc, key) => {
      acc[key as keyof T] = key as keyof T;
      return acc;
    },
    {} as Record<keyof T, keyof T>,
  );
}
