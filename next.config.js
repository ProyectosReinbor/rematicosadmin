const nextConfig = {
  output: "standalone",
  experimental: {
    turbo: {
      rules: {
        "*.svg": {
          loaders: [],
          as: "*",
        },
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;