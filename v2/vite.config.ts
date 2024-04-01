import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../Parse-Dashboard/public/v2',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: '[name].bundle.js',
        assetFileNames: '[name].bundle.[ext]',
      },
    },
  },
  base: '/v2/',
});
