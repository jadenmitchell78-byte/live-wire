/** @type {import('next').NextConfig} */
const isAndroid = process.platform === 'android';

const nextConfig = {
  reactStrictMode: false,
  swcMinify: !isAndroid,
  experimental: isAndroid
    ? {
        cpus: 1,
        workerThreads: false,
      }
    : undefined,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.espncdn.com' },
      { protocol: 'https', hostname: '**.wikimedia.org' },
      { protocol: 'https', hostname: 'image.tmdb.org' },
    ],
  },
};

export default nextConfig;
