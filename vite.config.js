import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  // Keep the interactive app separate from temporary Vite/test instances.
  cacheDir: "node_modules/.vite-gallery",
  optimizeDeps: {
    entries: ["index.html"],
    include: [
      "@uiw/react-codemirror",
      "@codemirror/lang-html",
      "@codemirror/lang-css",
      "@codemirror/lang-javascript",
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/@codemirror") ||
            id.includes("node_modules/@lezer") ||
            id.includes("node_modules/style-mod") ||
            id.includes("node_modules/w3c-keyname") ||
            id.includes("node_modules/crelt")
          )
            return "code-editor";
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:3001",
        // Keep the browser's host so the backend can compare it with Origin.
        changeOrigin: false,
      },
    },
  },
});
