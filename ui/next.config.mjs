/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */

import { withSentryConfig } from "@sentry/nextjs";
import { withPlausibleProxy } from "next-plausible";
import path from "path";
import { fileURLToPath } from "url";

import { contentSecurityPolicy, inline } from "./csp.mjs";

const nextConfig = {
  transpilePackages: ["shared"],
  poweredByHeader: false,
  swcMinify: true,
  experimental: {
    outputFileTracingRoot: path.join(path.dirname(fileURLToPath(import.meta.url)), "../"),
  },
  output: "standalone",
  sentry: {
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
    hideSourceMaps: false,
    widenClientFileUpload: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: inline(contentSecurityPolicy),
          },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource",
    });
    return config;
  },
};

export default withSentryConfig(withPlausibleProxy()(nextConfig));
