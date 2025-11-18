/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@jobsmv/ui-tripled", "@jobsmv/types"],
  // Disable cacheComponents to allow the build to complete
  // Individual components can still use "use cache" if needed
  // cacheComponents: true,
};

module.exports = nextConfig;

