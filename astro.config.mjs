import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://imajitek.pages.dev",
  output: "static",
  integrations: [react(), sitemap()],
  build: {
    inlineStylesheets: "auto"
  },
  vite: {
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname
      }
    }
  }
});
