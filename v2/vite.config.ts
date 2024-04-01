import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
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
