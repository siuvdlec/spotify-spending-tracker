import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/spotify-spending-tracker/",
  plugins: [react()],
  build: {
    outDir: "build",
  },
  test: {
    environment: "jsdom",
  },
});
