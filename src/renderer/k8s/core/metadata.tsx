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
