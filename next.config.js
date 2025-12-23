/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'api.qrserver.com' }
    ],
  },
  // Tempo platform configuration
  experimental: {
    serverActions: {
      allowedOrigins: process.env.TEMPO === "true" ? ["*.tempo.build"] : undefined,
    },
  },
};

export default nextConfig;
