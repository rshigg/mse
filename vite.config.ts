import { defineConfig } from 'vite';
import reactRefresh from '@vitejs/plugin-react-refresh';
import reactSvgPlugin from 'vite-plugin-react-svg';
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin';
import tsconfigPaths from 'vite-tsconfig-paths';
import crossOriginIsolation from 'vite-plugin-cross-origin-isolation';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  plugins: [
    reactRefresh(),
    // TODO: Configure PWA
    VitePWA(),
    reactSvgPlugin({
      defaultExport: 'url',
      expandProps: 'end',
      svgo: true,
      svgoConfig: {
        plugins: [{ removeAttrs: { attrs: '(width|height|fill)' } }],
      },
    }),
    vanillaExtractPlugin(),
    crossOriginIsolation(),
    // keep this as the last plugin
    tsconfigPaths({ root: '.' }),
  ],
});
