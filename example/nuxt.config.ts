import tailwindcss from '@tailwindcss/vite';

// Cloudflare compatibility date — keep the two copies below in sync.
const COMPATIBILITY_DATE = '2026-10-25';

export default defineNuxtConfig({
  compatibilityDate: COMPATIBILITY_DATE,

  modules: ['@nuxtjs/color-mode'],

  devtools: { enabled: false },

  css: ['maplibre-gl/dist/maplibre-gl.css', '~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // Cookie-backed so the server renders the right class on <html>; the
  // module's inline head script resolves "system" before first paint.
  colorMode: {
    preference: 'system',
    fallback: 'light',
    classSuffix: '',
    storage: 'cookie',
    storageKey: 'interpolate-heatmap-color-mode',
  },

  // Public IDs ship in the HTML; they are not secrets. Override per env with
  // NUXT_PUBLIC_GTAG_ID, NUXT_PUBLIC_PLAUSIBLE_SCRIPT_ID, etc. An empty
  // gtagId skips GA4 entirely (no GA4 property exists for this host yet).
  runtimeConfig: {
    public: {
      gtagId: '',
      plausibleScriptId: 'pa-kYj5TULQnfG2MJCL_KoIS',
      plausibleApiHost: 'https://analytics.geoql.in',
      openpanelClientId: 'acd0cc97-bba2-4c4a-a058-4b033555a8f9',
      openpanelApiUrl: 'https://events.geoql.in/api',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title:
        'maplibre-gl-interpolate-heatmap: interpolated heatmaps for MapLibre',
      meta: [
        {
          name: 'description',
          content:
            'A MapLibre GL custom layer that paints an inverse-distance-weighted heatmap of point values. Live demo with current world temperatures.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        {
          rel: 'preload',
          href: '/fonts/clash-display-600.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
        },
        {
          rel: 'preload',
          href: '/fonts/satoshi-400.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
        },
      ],
    },
  },

  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      nodeCompat: true,
      deployConfig: true,
      // Merged into the generated .output/server/wrangler.json.
      wrangler: {
        name: 'maplibre-gl-interpolate-heatmap-demo',
        account_id: 'bd11b1c42ee2759044a1769f80f704dd',
        compatibility_date: COMPATIBILITY_DATE,
        workers_dev: true,
        preview_urls: false,
        routes: [
          {
            pattern: 'maplibre-gl-interpolate-heatmap.geoql.in',
            custom_domain: true,
          },
        ],
        observability: { enabled: true },
      },
    },
  },

  typescript: {
    strict: true,
  },
});
