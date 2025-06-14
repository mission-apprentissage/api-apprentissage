// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import { captureConsoleIntegration, extraErrorDataIntegration, httpIntegration, init } from "@sentry/nextjs";

import { publicConfig } from "./config.public";

init({
  dsn: publicConfig.sentry.dsn,
  tracesSampleRate: publicConfig.env === "production" ? 0.01 : 1.0,
  tracePropagationTargets: [
    /^https:\/\/[^/]*\.apprentissage\.beta\.gouv\.fr/,
    publicConfig.baseUrl,
    publicConfig.apiEndpoint,
  ],
  environment: publicConfig.env,
  enabled: publicConfig.env !== "local",
  release: publicConfig.version,
  normalizeDepth: 8,
  integrations: [
    httpIntegration({}),
    captureConsoleIntegration({ levels: ["error"] }),
    extraErrorDataIntegration({ depth: 8 }),
  ],
});
