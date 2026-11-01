// @ts-check
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
    build: {
      // three.js core alone minifies to ~700 kB; the default 500 kB warning is noise here.
      chunkSizeWarningLimit: 1000,
    },
  },
});
