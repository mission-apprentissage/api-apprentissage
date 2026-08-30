import { isBoom } from "@hapi/boom"
import * as Sentry from "@sentry/node"
import { nodeProfilingIntegration } from "@sentry/profiling-node"

import config from "@/config.js"

// Le canal de diagnostic fastify remonte l'erreur AVANT que le gestionnaire d'erreurs n'ait posé
// le statut sur la réponse : `reply.statusCode` vaut encore 200 et le prédicat par défaut de
// l'intégration (`>= 500 || <= 299`) capture donc aussi les 4xx. On s'appuie sur le statut porté
// par l'erreur elle-même quand elle en porte un.
function getErrorStatusCode(error: unknown): number | null {
  if (isBoom(error)) {
    return error.output.statusCode
  }

  const statusCode = (error as { statusCode?: unknown } | null)?.statusCode

  return typeof statusCode === "number" ? statusCode : null
}

export function shouldHandleFastifyError(error: unknown, replyStatusCode: number): boolean {
  const statusCode = getErrorStatusCode(error)

  if (statusCode !== null) {
    return statusCode >= 500
  }

  // Erreur sans statut : on conserve le comportement par défaut de l'intégration.
  return replyStatusCode >= 500 || replyStatusCode <= 299
}

// Les avertissements du runtime Node (`process.emitWarning`) sont écrits sur `console.error` :
// `captureConsoleIntegration` les remonte donc comme des erreurs Sentry. Ils restent visibles
// dans les logs des conteneurs, mais n'ont rien à faire dans la liste des incidents.
const NODE_RUNTIME_WARNING = /^\(node:\d+\) /

function getOptions(): Sentry.NodeOptions {
  return {
    tracesSampler: (samplingContext) => {
      // Continue trace decision, if there is any parentSampled information
      if (samplingContext.parentSampled != null) {
        return samplingContext.parentSampled
      }

      if (samplingContext.attributes?.["sentry.op"] === "processor.job") {
        // Sample 100% of processor jobs
        return 1.0
      }

      return config.env === "production" ? 0.01 : 1.0
    },
    tracePropagationTargets: [/^https:\/\/[^/]*\.apprentissage\.beta\.gouv\.fr/],
    profilesSampleRate: 0.001,
    environment: config.env,
    release: config.version,
    ignoreErrors: [NODE_RUNTIME_WARNING],
    enabled: config.env !== "local",
    integrations: [
      Sentry.httpIntegration(),
      Sentry.fastifyIntegration({ shouldHandleError: (error, _request, reply) => shouldHandleFastifyError(error, reply.statusCode) }),
      Sentry.mongoIntegration(),
      Sentry.captureConsoleIntegration({ levels: ["error"] }),
      Sentry.extraErrorDataIntegration({ depth: 16 }),
      nodeProfilingIntegration(),
    ],
  }
}

export function initSentry(): void {
  Sentry.init(getOptions())
}

export async function closeSentry(): Promise<void> {
  await Sentry.close(2_000)
}
