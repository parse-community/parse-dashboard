import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../Parse-Dashboard/v2',
    emptyOutDir: true,
  },
  base: '/v2/',
});
