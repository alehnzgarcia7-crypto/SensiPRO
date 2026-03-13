import withPWAInit from '@ducanh2912/next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  fallbacks: {
    document: '/offline',
  },
  workboxOptions: {
    skipWaiting: true,
    exclude: [
      // No precachear chunks de admin/command-center (solo los usa el admin)
      /command-center/,
      /\(admin\)/,
      // No precachear chunks de páginas secundarias
      /\(main\)\/academy/,
      /\(main\)\/favorites/,
      /app\/checkout/,
      // No precachear source maps
      /\.map$/,
    ],
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
        },
      },
      {
        urlPattern: /^https:\/\/img\.youtube\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'youtube-thumbs',
          expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /\/api\/devices\/.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'device-api',
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 },
        },
      },
      {
        urlPattern: /\/api\/tips.*/i,
        handler: 'StaleWhileRevalidate',
        options: {
          cacheName: 'tips-api',
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 },
        },
      },
    ],
  },
});

const nextConfig = {
  reactStrictMode: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  transpilePackages: [
    '@ares/database',
    '@ares/algorithms',
    '@ares/types',
    '@ares/errors',
    '@ares/logger',
    '@ares/utils',
    '@ares/config',
  ],
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
  images: {
    minimumCacheTTL: 86400,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'fdn2.gsmarena.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default withPWA(nextConfig);
