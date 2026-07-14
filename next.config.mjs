/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "better-auth"]
  },
  images: {
    formats: ["image/avif", "image/webp"]
  }
};

export default nextConfig;
