import { badRequest, Boom, internal, isBoom } from "@hapi/boom";
import { captureException } from "@sentry/node";
import { FastifyError } from "fastify";
import { ResponseValidationError } from "fastify-type-provider-zod/dist/ResponseValidationError.js";
import { IResError } from "shared/routes/common.routes";
import { ZodError } from "zod";

import config from "@/config.js";
import { Server } from "@/server/server.js";

export function boomify(rawError: FastifyError | Boom<unknown> | Error | ZodError): Boom<unknown> {
  if (isBoom(rawError)) {
    return rawError;
  }

  if (rawError instanceof ResponseValidationError) {
    if (config.env === "local") {
      const zodError = new ZodError(rawError.details.error);
      return internal(rawError.message, {
        validationError: zodError.format(),
      });
    }

    return internal();
  }

  if (rawError instanceof ZodError) {
    return badRequest("Request validation failed", { validationError: rawError.format() });
  }

  if ((rawError as FastifyError).statusCode) {
    return new Boom(rawError.message, {
      statusCode: (rawError as FastifyError).statusCode ?? 500,
      data: { rawError },
    });
  }

  if (config.env === "local") {
    return internal(rawError.message, { rawError, cause: rawError });
  }

  return internal();
}

export function errorMiddleware(server: Server) {
  server.setErrorHandler<FastifyError | Boom<unknown> | Error | ZodError, { Reply: IResError }>(
    (rawError, _request, reply) => {
      const error = boomify(rawError);

      const payload: IResError = {
        statusCode: error.output.statusCode,
        name: error.output.payload.error,
        message: error.message,
        ...(error.data ? { data: error.data } : {}),
      };

      if (error.output.statusCode >= 500) {
        server.log.error(rawError instanceof ZodError ? rawError.format() : rawError);
        captureException(rawError);
      }

      return reply.status(payload.statusCode).send(payload);
    }
  );
}
