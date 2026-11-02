import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi/openapi.json",
  output: {
    path: "src/generated",
    clean: true,
  },
  plugins: [
    "@hey-api/typescript",
    "@hey-api/client-fetch",
    { name: "@hey-api/sdk", operations: { strategy: "flat" } },
  ],
});
