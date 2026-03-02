/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // ─── Image Optimization ──────────────────────────────────────────
  images: {
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
  output: 'standalone',

  // ─── Headers ──────────────────────────────────────────────────────
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
        // Cache static assets aggressively
        source: '/icons/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Cache fonts
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

  // ─── Redirects ────────────────────────────────────────────────────
  async redirects() {
    return [
      {
        source: '/login',
        destination: '/',
        permanent: false,
      },
    ];
  },

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
