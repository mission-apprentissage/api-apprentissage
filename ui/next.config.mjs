/** @type {import('next').NextConfig} */

import { withSentryConfig } from "@sentry/nextjs"
import { withPlausibleProxy } from "next-plausible"
import path from "path"
import { fileURLToPath } from "url"

const nextConfig = {
  transpilePackages: ["shared", "api-alternance-sdk"],
  poweredByHeader: false,
  productionBrowserSourceMaps: true,
  outputFileTracingRoot: path.join(path.dirname(fileURLToPath(import.meta.url)), "../"),

  async headers() {
    return [
      {
        source: "/:lang/documentation-technique/try",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "https://www.data.gouv.fr",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,HEAD,OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type, Authorization",
          },
          {
            key: "Vary",
            value: "Origin",
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: "/catalogue-des-donnees/:slug*",
        destination: "/explorer/:slug*", // Matched parameters can be used in the destination
        permanent: true,
      },
    ]
  },
  // Next 16 construit avec Turbopack par défaut, qui gère nativement ce que la config webpack
  // faisait ici : émission des .woff2 du DSFR, top-level await de bson côté client
  // (cf. https://github.com/vercel/next.js/issues/54282) et résolution des imports en .js
  // vers les sources .ts. La config webpack a donc été retirée plutôt que laissée inerte.
  output: "standalone",
}

export default withSentryConfig(withPlausibleProxy()(nextConfig), {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  org: "sentry",
  project: "api-ui",
  sentryUrl: "https://sentry.apprentissage.beta.gouv.fr/",

  // Only print logs for uploading source maps in CI
  silent: false,

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // `reactComponentAnnotation`, `disableLogger` et `hideSourceMaps` ont été retirées : les deux
  // premières sont dépréciées côté Sentry et sans effet avec Turbopack, bundler par défaut depuis
  // Next 16 ; la troisième a purement disparu du SDK en v10, elle n'était plus lue.

  // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  // This can increase your server load as well as your hosting bill.
  // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
  // side errors will fail.
  // tunnelRoute: "/monitoring",

  sourcemaps: {
    deleteSourcemapsAfterUpload: false,
  },

  // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
  // See the following for more information:
  // https://docs.sentry.io/product/crons/
  // https://vercel.com/docs/cron-jobs
  // automaticVercelMonitors: true,
})
