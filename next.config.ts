import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  telemetry: false,
  reactStrictMode: false,
  experimental: {
    scrollRestoration: true,
    optimizeCss: true,
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      path: false,
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.digitalax.xyz",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "/lens/**",
      },
    ],
    unoptimized: true,
  },
  trailingSlash: true,
  async headers() {
    let headersConfig: {
      source: string;
      headers: { key: string; value: string }[];
    }[] = [];

    const allowedOrigins = [
      "https://cdn.digitalax.xyz",
      "https://triplea.agentmeme.xyz",
      "https://ik.imagekit.io",
    ];
    allowedOrigins.forEach((origin) => {
      headersConfig.push({
        source: "/(.*)",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: origin,
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "Origin, X-Requested-With, Content-Type, Accept, Authorization",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, PUT, DELETE, OPTIONS",
          },
        ],
      });
    });

    return headersConfig;
  },
};

export default nextConfig;
