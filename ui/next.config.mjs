/* eslint-disable @typescript-eslint/no-var-requires */
/** @type {import('next').NextConfig} */

import { withSentryConfig } from "@sentry/nextjs";
import { withPlausibleProxy } from "next-plausible";
import path from "path";
import { fileURLToPath } from "url";

const nextConfig = {
  transpilePackages: ["shared", "api-alternance-sdk"],
  poweredByHeader: false,
  swcMinify: true,
  experimental: {
    outputFileTracingRoot: path.join(path.dirname(fileURLToPath(import.meta.url)), "../"),
    typedRoutes: true,
  },

  async redirects() {
    return [
      {
        source: "/catalogue-des-donnees/:slug*",
        destination: "/explorer/:slug*", // Matched parameters can be used in the destination
        permanent: true,
      },
    ];
  },
  output: "standalone",
  sentry: {
    disableServerWebpackPlugin: true,
    disableClientWebpackPlugin: true,
    hideSourceMaps: false,
    widenClientFileUpload: true,
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.woff2$/,
      type: "asset/resource",
    });
    config.module.rules.push({
      test: /\.md$/,
      type: "asset/source",
    });
    // Bson is using top-level await, which is not supported by default in Next.js in client side
    // Probably related to https://github.com/vercel/next.js/issues/54282
    config.resolve.alias.bson = path.join(path.dirname(fileURLToPath(import.meta.resolve("bson"))), "bson.cjs");

    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
      ".cjs": [".cts", ".cjs"],
    };
    return config;
  },
};

export default withSentryConfig(withPlausibleProxy()(nextConfig));
