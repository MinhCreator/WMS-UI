import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import ResizeImage from "vite-plugin-resize-image/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    ResizeImage(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
  resolve: {
    alias: {
      "@/": path.resolve(import.meta.dirname, "./src"),
    },
  },
  server: {
    // Same-origin /api during `vite dev`; override the target for a remote API.
    proxy: {
      "/api": {
        target: process.env.VITE_DEV_API_TARGET ?? "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },
});
