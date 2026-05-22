/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack(config) {
    // Suppress false-positive Edge Runtime warning dari jose (dipakai next-auth).
    // CompressionStream memang tersedia di Edge Runtime Next.js — ini hanya
    // artefak static analysis webpack yang terlalu konservatif.
    config.ignoreWarnings = [
      {
        module: /node_modules\/jose\/dist\/webapi\/lib\/deflate/,
        message: /CompressionStream/,
      },
    ];
    return config;
  },
};

export default nextConfig;
