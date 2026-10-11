import { Renderer } from "@freelensapp/extensions";
import { describe, expect, it } from "vitest";
import { AlertDetails as AlertDetails_v1beta2 } from "./components/details/notification/alert-details-v1beta2";
import { Alert as Alert_v1beta1 } from "./k8s/fluxcd/notification/alert-v1beta1";
import { ExternalArtifact as ExternalArtifact_v1 } from "./k8s/fluxcd/source/externalartifact-v1";
import { GitRepository as GitRepository_v1 } from "./k8s/fluxcd/source/gitrepository-v1";
import { FluxCDObjectSpecSuspendResumeMenuItem } from "./menus/fluxcd-object-spec-suspend-resume-menu-item";

// The type check is the test here. Each registration pairs a component with a
// model class it was not written for, and `pnpm type:check` fails on the unused
// `@ts-expect-error` once `detailsFor` or `menuItemFor` accepts the pairing.
// At runtime the helpers check no types and return the registration.
describe("the typed registration helpers", () => {
  it("reject the details panel of another version of the kind", () => {
    const registration = Renderer.K8sApi.detailsFor(Alert_v1beta1, {
      priority: 10,
      // @ts-expect-error The panel of v1beta2 for the objects of v1beta1, told apart by their `declare apiVersion`.
      Details: (props) => <AlertDetails_v1beta2 {...props} />,
    });

    expect(registration.apiVersions).toEqual(["notification.toolkit.fluxcd.io/v1beta1"]);
  });

  it("reject the spec Suspend/Resume item for a kind without spec.suspend", () => {
    const registration = Renderer.K8sApi.menuItemFor(ExternalArtifact_v1, {
      // @ts-expect-error An ExternalArtifact has no `spec.suspend`.
      MenuItem: (props) => <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={ExternalArtifact_v1} />,
    });

    expect(registration.kind).toBe("ExternalArtifact");
  });

  it("reject the spec Suspend/Resume item for a kind without spec.suspend in a list, as the extension registers it", () => {
    const registrations = [GitRepository_v1, ExternalArtifact_v1].map((kubeObjectClass) =>
      Renderer.K8sApi.menuItemFor<InstanceType<typeof kubeObjectClass>>(kubeObjectClass, {
        // @ts-expect-error The list has ExternalArtifact, which has no `spec.suspend`.
        MenuItem: (props) => <FluxCDObjectSpecSuspendResumeMenuItem {...props} resource={kubeObjectClass} />,
      }),
    );

    expect(registrations.map(({ kind }) => kind)).toEqual(["GitRepository", "ExternalArtifact"]);
  });
});
