import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    turbo: {
      rules: {
        '*.ttf': {
          loaders: ['file-loader'],
          as: '*.ttf',
        },
      },
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Server-side configuration for react-pdf
      config.externals = config.externals || [];
      config.externals.push({
        canvas: 'canvas',
        'react-native': 'react-native',
      });
    }

    // Handle canvas dependency for react-pdf
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      'react-native': false,
    };

    // Handle font files
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });

    return config;
  },
};

export default nextConfig;
