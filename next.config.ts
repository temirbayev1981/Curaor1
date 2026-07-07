import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  serverExternalPackages: ['openai', 'sanitize-html'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
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
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://api.stripe.com https://api.mapbox.com https://www.google-analytics.com https://www.googletagmanager.com; frame-src https://js.stripe.com;",
          },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ];
  },
};

export default nextConfig;
