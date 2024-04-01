import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../Parse-Dashboard/v2',
    emptyOutDir: true,
  },
  base: '',
});
