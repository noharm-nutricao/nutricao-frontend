/// <reference types="vitest" />
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    // Only pick up Vitest unit tests — exclude Playwright .spec.ts files
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["tests/**", "node_modules/**"],
  },
  resolve: {
    alias: {
      src: "/Users/mateus/Documents/GitHub/nitra/frontend/src",
      features: "/Users/mateus/Documents/GitHub/nitra/frontend/src/features",
      store: "/Users/mateus/Documents/GitHub/nitra/frontend/src/store",
      services: "/Users/mateus/Documents/GitHub/nitra/frontend/src/services",
      models: "/Users/mateus/Documents/GitHub/nitra/frontend/src/models",
    },
  },
});
