/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@jobsmv/ui-tripled", "@jobsmv/types"],
  experimental: {
    cacheComponents: true,
  },
};

module.exports = nextConfig;

