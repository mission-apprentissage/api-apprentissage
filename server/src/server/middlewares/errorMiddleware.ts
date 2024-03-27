import Boom from "@hapi/boom";
import { captureException } from "@sentry/node";
import { FastifyError } from "fastify";
import { ResponseValidationError } from "fastify-type-provider-zod";
import { IResError } from "shared/routes/common.routes";
import { ZodError } from "zod";

import config from "@/config";

import { Server } from "../server";

export function boomify(rawError: FastifyError | Boom.Boom<unknown> | Error | ZodError): Boom.Boom<unknown> {
  if (Boom.isBoom(rawError)) {
    return rawError;
  }

  if (rawError.name === "ResponseValidationError") {
    if (config.env === "local") {
      const zodError = (rawError as ResponseValidationError).details as ZodError;
      return Boom.internal(rawError.message, {
        validationError: zodError.format(),
      });
    }

    return Boom.internal();
  }

  if (rawError instanceof ZodError) {
    return Boom.badRequest("Request validation failed", { validationError: rawError.format() });
  }

  if ((rawError as FastifyError).statusCode) {
    return new Boom.Boom(rawError.message, {
      statusCode: (rawError as FastifyError).statusCode ?? 500,
      data: { rawError },
    });
  }

  if (config.env === "local") {
    return Boom.internal(rawError.message, { rawError, cause: rawError });
  }

  return Boom.internal();
}

export function errorMiddleware(server: Server) {
  server.setErrorHandler<FastifyError | Boom.Boom<unknown> | Error | ZodError, { Reply: IResError }>(
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
