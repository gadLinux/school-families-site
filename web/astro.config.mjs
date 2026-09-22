// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://familiasdiegovelazquez.es',
  output: 'static',
  trailingSlash: 'ignore',
  devToolbar: { enabled: false },
  build: {
    format: 'directory',
  },
  vite: {
    server: {
      // En local, /api va a PocketBase (pb/dev.sh). En el servidor lo hace nginx.
      // Mismo origen en los dos casos: sin CORS y sin cambiar la CSP.
      proxy: { '/api': 'http://127.0.0.1:8090' },
    },
  },
});
