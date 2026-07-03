import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    exclude: ["integration/**", "node_modules/**", "out/**"],
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    passWithNoTests: true,
    alias: {
      // The real `@freelensapp/extensions` is the Freelens host renderer bundle
      // which needs a browser; swap it for a lightweight stub so extension
      // modules can be imported and their pure logic exercised under Node.
      "@freelensapp/extensions": resolve(__dirname, "test/stubs/freelensapp-extensions.ts"),
    },
  },
});
