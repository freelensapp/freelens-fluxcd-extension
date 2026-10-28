import { defineConfig } from "vitest/config";

// The integration tests attach to Freelens dev over CDP and drive one app, so
// they are not part of vitest.config.ts and run only via
// `pnpm test:integration`.
export default defineConfig({
  test: {
    name: "integration",
    environment: "node",
    include: ["integration/__tests__/**/*.tests.ts"],
    // One app, one session at a time: the sessions install the extension and
    // change the CRD on one cluster.
    fileParallelism: false,
    testTimeout: 120_000,
    hookTimeout: 120_000,
  },
});
