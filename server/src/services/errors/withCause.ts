import { captureException } from "@sentry/node"

// `cause` est typé `unknown` : c'est ce que `throw` autorise, ce que `Error.cause` accepte
// et ce que `captureException` prend en entrée. La contrainte `Error` était plus étroite que
// la réalité et forçait les appelants à mentir sur le type de ce qu'ils avaient attrapé.
export function withCause<T extends Error>(error: T, cause: unknown, level: "fatal" | "error" | "warning" = "error"): T {
  error.cause = cause
  captureException(cause, { level })
  return error
}
