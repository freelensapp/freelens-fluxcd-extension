export interface KubeObjectMetadata {
  name: string;
  namespace?: string;
  selfLink: string;
  uid?: string;
  generation?: number;
  creationTimestamp?: string;
  resourceVersion?: string;
  labels?: Partial<Record<string, string>>;
  annotations?: Partial<Record<string, string>>;
  finalizers?: string[];
  [key: string]: unknown;
}

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

export interface Condition {
  type?: string;
  status: string;
  observedGeneration?: number;
  lastTransitionTime: string;
  reason: string;
  message: string;
}
