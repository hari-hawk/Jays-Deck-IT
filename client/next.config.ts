import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // During local development, proxy /api/* requests to the Express server
  // running on port 4000. In production (Vercel), the rewrites in vercel.json
  // route /api/* to the serverless function instead.
  async rewrites() {
    return process.env.NODE_ENV === "development"
      ? [
          {
            source: "/api/:path*",
            destination: "http://localhost:4000/api/:path*",
          },
        ]
      : [];
  },
};

export default nextConfig;
