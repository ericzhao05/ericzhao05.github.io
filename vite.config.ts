import { defineConfig } from "vite";

// Custom domain (ericzhao05.com) serves from root, so base is "/".
// build.rollupOptions keeps a single entry; 404.html is copied from public/ for
// the GitHub Pages SPA deep-link fallback.
export default defineConfig({
  base: "/",
  build: {
    target: "es2020",
    assetsInlineLimit: 4096,
  },
});
