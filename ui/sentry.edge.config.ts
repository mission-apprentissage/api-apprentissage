// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { captureConsoleIntegration, extraErrorDataIntegration, init } from "@sentry/nextjs"

import { publicConfig } from "./config.public"

// Les avertissements du runtime Node (`process.emitWarning`) sont écrits sur `console.error` :
// `captureConsoleIntegration` les remonte donc comme des erreurs Sentry. Ils restent visibles
// dans les logs des conteneurs, mais n'ont rien à faire dans la liste des incidents.
const NODE_RUNTIME_WARNING = /^\(node:\d+\) /

init({
  dsn: publicConfig.sentry.dsn,
  tracesSampleRate: publicConfig.env === "production" ? 0.01 : 1.0,
  tracePropagationTargets: [/^https:\/\/[^/]*\.apprentissage\.beta\.gouv\.fr/, publicConfig.baseUrl, publicConfig.apiEndpoint],
  environment: publicConfig.env,
  enabled: publicConfig.env !== "local",
  release: publicConfig.version,
  ignoreErrors: [NODE_RUNTIME_WARNING],
  normalizeDepth: 8,
  integrations: [captureConsoleIntegration({ levels: ["error"] }), extraErrorDataIntegration({ depth: 8 })],
})
