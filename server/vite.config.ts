import { defineConfig } from "vite";
import { loadEnv } from "vite";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    env: loadEnv("", process.cwd(), ""),
    setupFiles: ["dotenv/config", "./src/tests/setup.ts"],
    coverage: {
      reporter: ["text", "json", "html"],
    },
  },
});
