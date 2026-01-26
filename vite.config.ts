import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
      "@store": "/src/store",
      "@store/": "/src/store/",
      "@components": "/src/components",
      "@components/": "/src/components/",
      "@pages": "/src/pages",
      "@pages/": "/src/pages/",
      "@hooks": "/src/hooks",
      "@hooks/": "/src/hooks/",
      "@api": "/src/api",
      "@api/": "/src/api/",
      "@types": "/src/types",
      "@types/": "/src/types/",
      "@styles": "/src/styles",
      "@styles/": "/src/styles/",
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    minify: "terser",
  },
});
