// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { captureConsoleIntegration, extraErrorDataIntegration, httpIntegration, init } from "@sentry/nextjs"

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
  integrations: [httpIntegration({}), captureConsoleIntegration({ levels: ["error"] }), extraErrorDataIntegration({ depth: 8 })],
})
