/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**.espncdn.com' },
      { protocol: 'https', hostname: '**.wikimedia.org' },
    ],
  },
};

export default nextConfig;
