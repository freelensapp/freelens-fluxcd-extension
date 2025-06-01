import { Selector } from "../core/types";

export interface LocalObjectReference {
  name: string;
}

export interface NamespacedObjectReference {
  name: string;
  namespace?: string;
}

export interface NamespacedObjectKindReference {
  apiVersion?: string;
  kind: string;
  name: string;
  namespace?: string;
}

export interface Image {
  name: string;
  newName?: string;
  newTag?: string;
  digest?: string;
}

export interface JSON6902Patch {
  patch: {
    op: "add" | "remove" | "replace" | "move" | "copy" | "test";
    path: string;
    from?: string;
    value?: any;
  };
  target: Selector;
}

export interface Snapshot {
  checksum: string;
  entries: {
    namespace: string;
    kinds: Record<string, string>;
  }[];
}
