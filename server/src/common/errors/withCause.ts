import { captureException } from "@sentry/node";

export function withCause<T extends Error>(error: T, cause: Error): T {
  error.cause = cause;
  captureException(cause);
  return error;
}
