import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.16.0.2"],
  output: "standalone",
  outputFileTracingIncludes: {
    '/app/apps/web/**/*': ['/app/node_modules/dockerode/**/*'],
  },
};

export default nextConfig;