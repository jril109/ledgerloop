import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    env: { ENCRYPTION_KEY: "0".repeat(64) },
  },
  resolve: { alias: { "@": resolve(__dirname, "src") } },
});
