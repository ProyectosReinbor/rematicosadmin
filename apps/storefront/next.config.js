const nextConfig = {
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
  poweredByHeader: false,
  compress: true,
};

module.exports = nextConfig;
