import { defineConfig } from "vite";
import { builtinModules } from "module";
import pkg from "./package.json";
import babel from "vite-plugin-babel";

export default defineConfig({
  plugins: [babel()],
  build: {
    outDir: "dist",
    modulePreload: {
      polyfill: false, // Add this
    },
    ssr: true,
    rollupOptions: {
      input: ["src/main.ts"],
      output: {
        format: "esm",
        preserveModules: true,
      },
      external: [...builtinModules, ...Object.keys(pkg.dependencies || {})],
    },
  },
  optimizeDeps: {
    exclude: ["fsevents"],
  },
});
