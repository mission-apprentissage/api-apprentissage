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

// esbuild nomme les chunks du build `<nom>-<hash>.js` et le SDK en dérive le `module` des frames
// (`main-QT4XI7V2`), que Sentry fait primer sur le nom de fichier pour regrouper les erreurs :
// sans normalisation, chaque build ouvre de nouvelles issues pour les mêmes erreurs
// (labonnealternance#5334).
const BUNDLE_CHUNK_HASH = /-[A-Z2-7]{8}$/

export function normalizeBundleChunkModule(frame: Sentry.StackFrame): Sentry.StackFrame {
  // Les modules de node_modules (`pkg.dir:fichier`) et des sous-dossiers du build
  // (`migrations:fichier`) contiennent un `:` et ne sont pas des chunks.
  if (frame.module === undefined || frame.module.includes(":")) {
    return frame
  }

  return { ...frame, module: frame.module.replace(BUNDLE_CHUNK_HASH, "") }
}

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
      // L'`iteratee` remplace la réécriture par défaut des `filename` en `app:///…` : seul le
      // `module` des frames est modifié.
      Sentry.rewriteFramesIntegration({ iteratee: normalizeBundleChunkModule }),
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
