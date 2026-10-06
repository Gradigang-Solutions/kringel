import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Strudel (moteur audio, transpileur, tonal) pèse à lui seul environ 1,5 Mo minifié.
    chunkSizeWarningLimit: 2000,
  },
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      include: ["src/model/**", "src/codegen/**", "src/lib/**", "src/storage/**"],
    },
  },
});
