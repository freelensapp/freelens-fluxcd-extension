import { Common, Renderer } from "@freelensapp/extensions";
import styles from "./available-version.module.scss";
import stylesInline from "./available-version.module.scss?inline";

export interface AvailableVersionPageProps {
  extension: Renderer.LensExtension;
}

type ResourceName =
  | "Flux Instances"
  | "Flux Reports"
  | "Resource Sets"
  | "Resource Set Input Providers"
  | "Kustomizations"
  | "Helm Release"
  | "Helm Releases"
  | "Git Repositories"
  | "Helm Repositories"
  | "Helm Charts"
  | "Buckets"
  | "OCI Repositories"
  | "Image Repositories"
  | "Image Policies"
  | "Image Update Automations"
  | "Alerts"
  | "Providers"
  | "Receivers";

/**
 * Configuration for a single API version variant.
 */
interface VersionVariant<T extends AvailableVersionPageProps> {
  kubeObjectClass: typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>;
  PageComponent: React.ComponentType<T>;
  version: string;
}

/**
 * Creates a page component that automatically selects the correct API version based on cluster availability.
 *
 * Tries versions in order and renders the first available one.
 * Shows a helpful message if no versions are available (CRD not installed).
 *
 * @param resourceName - Human-readable resource name (e.g., "OCI Repositories")
 * @param variants - Array of version variants, ordered by preference
 * @returns A page component that auto-detects a valid API version if present
 *
 * @example
 * ```tsx
 * createAvailableVersionPage(
 *   "OCI Repositories",
 *   [
 *     { kubeObjectClass: OCIRepository_v1, PageComponent: OCIRepositoriesPage_v1, version: "v1" },
 *     { kubeObjectClass: OCIRepository_v1beta2, PageComponent: OCIRepositoriesPage_v1beta2, version: "v1beta2" },
 *   ]
 * );
 * ```
 */
export function createAvailableVersionPage<T extends AvailableVersionPageProps>(
  resourceName: ResourceName,
  variants: VersionVariant<T>[],
): React.ComponentType<T> {
  return (props: T) => {
    for (const variant of variants) {
      try {
        const store = variant.kubeObjectClass.getStore();
        if (store) {
          Common.logger.debug(
            `[@freelensapp/fluxcd-extension]: Rendering ${resourceName} page with API version ${variant.version}`,
          );
          return <variant.PageComponent {...props} />;
        }
      } catch (error) {
        Common.logger.debug(
          `[@freelensapp/fluxcd-extension]: API version ${variant.version} not available for ${resourceName}: ${error}`,
        );
      }
    }

    // No version available - CRD not installed in cluster
    const triedVersions = variants.map((v) => v.version).join(", ");
    Common.logger.info(
      `[@freelensapp/fluxcd-extension]: ${resourceName} CRD not found in cluster (tried versions: ${triedVersions})`,
    );

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.unavailablePage}>
          <div className={styles.unavailableContent}>
            <h3 className={styles.unavailableTitle}>{resourceName} Not Available</h3>
            <p className={styles.unavailableMessage}>
              The <strong>{resourceName}</strong> CRDs are not installed in this cluster.
            </p>
            <p className={styles.unavailableDetails}>
              Tried API versions:{" "}
              <code>{triedVersions}</code>
            </p>
          </div>
        </div>
      </>
    );
  };
}
