export function withCause<T extends Error>(error: T, cause: Error): T {
  error.cause = cause;
  return error;
}
