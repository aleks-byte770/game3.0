import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
      "@store": resolve(__dirname, "./src/store"),
      "@store/": resolve(__dirname, "./src/store") + "/",
      "@components": resolve(__dirname, "./src/components"),
      "@components/": resolve(__dirname, "./src/components") + "/",
      "@pages": resolve(__dirname, "./src/pages"),
      "@pages/": resolve(__dirname, "./src/pages") + "/",
      "@hooks": resolve(__dirname, "./src/hooks"),
      "@hooks/": resolve(__dirname, "./src/hooks") + "/",
      "@api": resolve(__dirname, "./src/api"),
      "@api/": resolve(__dirname, "./src/api") + "/",
      "@types": resolve(__dirname, "./src/types"),
      "@types/": resolve(__dirname, "./src/types") + "/",
      "@styles": resolve(__dirname, "./src/styles"),
      "@styles/": resolve(__dirname, "./src/styles") + "/",
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
