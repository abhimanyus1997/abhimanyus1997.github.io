import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Make sure we compile index.html correctly and process imported assets.
    rollupOptions: {
      input: {
        main: './index.html',
        scanProfile: './scan-profile.html',
        faceScan: './face-scan.html'
      }
    }
  },
  server: {
    proxy: {
      '/api/tts': {
        target: 'http://13.126.102.204:5555',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/tts/, '/tts'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            if (req.headers['content-type']?.includes('multipart/form-data')) {
              proxyReq.setHeader('Content-Type', req.headers['content-type']);
            }
          });
        }
      },
      '/api/chat': {
        target: 'http://13.126.102.204:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/chat/, '/v1/chat/completions'),
        // LiteLLM may not require auth for some endpoints
      },
      '/api/models': {
        target: 'http://13.126.102.204:4000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/models/, '/v1/models')
      }
    }
  }
});
