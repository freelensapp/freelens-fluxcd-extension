export interface Selector {
  group?: string;
  version?: string;
  kind?: string;
  namespace?: string;
  name?: string;
  annotationSelector?: string;
  labelSelector?: string;
}

export interface Patch {
  patch: string;
  target: Selector;
}
