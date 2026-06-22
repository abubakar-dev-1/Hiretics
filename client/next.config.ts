import type { NextConfig } from "next";

// Proxy serverless API calls through Next so the browser stays same-origin
// (avoids LocalStack's broken API Gateway CORS preflight). The full LocalStack
// target is injected via SERVERLESS_API_TARGET (written by `npm run sync:env`).
const SERVERLESS_API_TARGET = process.env.SERVERLESS_API_TARGET || "";

const nextConfig: NextConfig = {
  async rewrites() {
    if (!SERVERLESS_API_TARGET) return [];
    return [
      {
        source: "/sl-api/:path*",
        destination: `${SERVERLESS_API_TARGET}/:path*`,
      },
    ];
  },
};

export default nextConfig;
