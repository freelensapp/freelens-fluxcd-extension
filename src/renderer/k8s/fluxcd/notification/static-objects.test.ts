import { describe, expectTypeOf, test } from "vitest";
import { Alert as Alert_v1 } from "./alert-v1";
import { Alert as Alert_v1beta2 } from "./alert-v1beta2";
import { Alert as Alert_v1beta3 } from "./alert-v1beta3";
import { Provider as Provider_v1 } from "./provider-v1";
import { Provider as Provider_v1beta2 } from "./provider-v1beta2";
import { Provider as Provider_v1beta3 } from "./provider-v1beta3";

import type { FluxCDKubeObjectStatus } from "../types";

// The CRDs of notification-controller have no `status` in the schemas of Alert and Provider `v1beta3` and `v1`, and
// no status subresource for them, and the API server prunes what the schema of the requested version lacks. Only
// `v1beta2`, which notification-controller v1.0 and v1.1 reconcile, has a status.
describe("the status of Alert and Provider", () => {
  test("is not modeled for v1 and v1beta3", () => {
    expectTypeOf<Alert_v1["status"]>().toEqualTypeOf<void | undefined>();
    expectTypeOf<Alert_v1beta3["status"]>().toEqualTypeOf<void | undefined>();
    expectTypeOf<Provider_v1["status"]>().toEqualTypeOf<void | undefined>();
    expectTypeOf<Provider_v1beta3["status"]>().toEqualTypeOf<void | undefined>();
  });

  test("is modeled for v1beta2", () => {
    expectTypeOf<NonNullable<Alert_v1beta2["status"]>>().toExtend<FluxCDKubeObjectStatus>();
    expectTypeOf<NonNullable<Provider_v1beta2["status"]>>().toExtend<FluxCDKubeObjectStatus>();
  });
});
