import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "fs";

function loadTsconfigPaths() {
  const tsconfig = JSON.parse(fs.readFileSync("./tsconfig.json", "utf-8"));
  const paths = tsconfig.compilerOptions.paths;
  const alias: Record<string, string> = {};
  
  Object.entries(paths).forEach(([key, values]: [string, any]) => {
    if (!key.includes("*")) {
      const target = (values[0] as string).replace(/\/index\.(ts|tsx)$/, "");
      alias[key] = path.resolve(__dirname, target);
    }
  });
  
  return alias;
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: loadTsconfigPaths(),
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
