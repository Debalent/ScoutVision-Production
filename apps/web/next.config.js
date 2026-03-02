/** @type {import('next').NextConfig} */

const isStaticExport = process.env.STATIC_EXPORT === 'true';

const nextConfig = {
  reactStrictMode: true,

  // ─── Image Optimization ──────────────────────────────────────────
  images: isStaticExport
    ? { unoptimized: true }
    : {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
          { protocol: 'https', hostname: '*.hudl.com' },
          { protocol: 'https', hostname: '*.maxpreps.com' },
          { protocol: 'https', hostname: 'storage.googleapis.com' },
        ],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      },

  // ─── Performance ──────────────────────────────────────────────────
  poweredByHeader: false,
  compress: true,

  // ─── Output Configuration ─────────────────────────────────────────
  // Static export for GitHub Pages, standalone for Vercel/Docker
  output: isStaticExport ? 'export' : 'standalone',

  // ─── GitHub Pages base path ───────────────────────────────────────
  ...(isStaticExport && {
    basePath: '/ScoutVision-Production',
    assetPrefix: '/ScoutVision-Production/',
  }),

  // ─── Headers (server-only) ────────────────────────────────────────
  ...(!isStaticExport && {
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            { key: 'X-Frame-Options', value: 'DENY' },
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          ],
        },
        {
          source: '/icons/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ],
        },
        {
          source: '/_next/static/:path*',
          headers: [
            { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
          ],
        },
      ];
    },
    async redirects() {
      return [
        {
          source: '/login',
          destination: '/',
          permanent: false,
        },
      ];
    },
  }),

  // ─── Webpack Customization ────────────────────────────────────────
  webpack: (config, { isServer }) => {
    // Ignore ONNX Runtime native modules in client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
