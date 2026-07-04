import { defineConfig } from 'vite';

export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Make sure we compile index.html correctly and process imported assets.
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});
