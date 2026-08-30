import { badRequest, internal, notFound } from "@hapi/boom"
import { describe, expect, it } from "vitest"
import { shouldHandleFastifyError } from "./sentry.js"

describe("shouldHandleFastifyError", () => {
  // Le canal de diagnostic fastify remonte l'erreur avant que le statut ne soit posé sur la
  // réponse : `replyStatusCode` vaut donc encore 200 dans tous ces cas.
  const replyStatusCodeBeforeErrorHandler = 200

  it("should capture boom server errors", () => {
    expect(shouldHandleFastifyError(internal("boom"), replyStatusCodeBeforeErrorHandler)).toBe(true)
  })

  it.each([[notFound("Aucune formation trouvée")], [badRequest("Request validation failed")]])("should not capture boom client error %#", (error) => {
    expect(shouldHandleFastifyError(error, replyStatusCodeBeforeErrorHandler)).toBe(false)
  })

  it("should not capture fastify errors carrying a client status code", () => {
    expect(shouldHandleFastifyError(Object.assign(new Error("bad request"), { statusCode: 400 }), replyStatusCodeBeforeErrorHandler)).toBe(false)
  })

  it("should capture errors without any status code", () => {
    expect(shouldHandleFastifyError(new Error("boom"), replyStatusCodeBeforeErrorHandler)).toBe(true)
  })
})
