import { fastifyCookie } from "@fastify/cookie";
import { fastifyCors } from "@fastify/cors";
import { fastifyMultipart } from "@fastify/multipart";
import { fastifyRateLimit } from "@fastify/rate-limit";
import type { FastifyStaticSwaggerOptions, StaticDocumentSpec } from "@fastify/swagger";
import { fastifySwagger } from "@fastify/swagger";
import type { FastifySwaggerUiOptions } from "@fastify/swagger-ui";
import { fastifySwaggerUi } from "@fastify/swagger-ui";
import { notFound } from "@hapi/boom";
import type { IApiRouteSchema, WithSecurityScheme } from "api-alternance-sdk";
import type {
  FastifyBaseLogger,
  FastifyInstance,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import { fastify } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { generateOpenApiSchema } from "shared/openapi/generateOpenapi";
import { z } from "zod/v4-mini";

import { apiKeyUsageMiddleware } from "./middlewares/apiKeyUsageMiddleware.js";
import { auth } from "./middlewares/authMiddleware.js";
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
import { logMiddleware } from "./middlewares/logMiddleware.js";
import { registerRoutes } from "./routes/routes.js";
import { initSentryFastify } from "@/services/sentry/sentry.fastify.js";
import config from "@/config.js";

export type Server = FastifyInstance<
  RawServerDefault,
  RawRequestDefaultExpression<RawServerDefault>,
  RawReplyDefaultExpression<RawServerDefault>,
  FastifyBaseLogger,
  ZodTypeProvider
>;

export async function bind(app: Server) {
  initSentryFastify(app);

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  const frSwaggerDoc = generateOpenApiSchema(config.version, config.env, config.apiPublicUrl, "fr");
  const enSwaggerDoc = generateOpenApiSchema(config.version, config.env, config.apiPublicUrl, "en");

  const swaggerOpts: FastifyStaticSwaggerOptions = {
    mode: "static",
    specification: {
      document: enSwaggerDoc as StaticDocumentSpec["document"],
    },
  };
  await app.register(fastifySwagger, swaggerOpts);
  await app.register(fastifyRateLimit, { global: false });

  const swaggerUiOptions: FastifySwaggerUiOptions = {
    routePrefix: "/api/documentation",
    uiConfig: {
      displayOperationId: true,
      operationsSorter: "method",
      tagsSorter: "alpha",
      docExpansion: "none",
      filter: true,
      deepLinking: true,
    },
  };
  await app.register(fastifySwaggerUi, swaggerUiOptions);

  app.get(
    "/api/swagger.json",
    {
      schema: {
        querystring: z.object({ lang: z.optional(z.string()) }),
      },
    },
    async (req, res) => {
      return res.header("content-type", "application/json").send(req.query.lang === "fr" ? frSwaggerDoc : enSwaggerDoc);
    }
  );

  app.register(fastifyCookie);
  app.decorate("auth", <S extends IApiRouteSchema & WithSecurityScheme>(scheme: S) => auth(scheme));

  app.register(fastifyMultipart);
  app.register(fastifyCors, {
    ...(config.env === "local"
      ? {
          origin: true,
          credentials: true,
        }
      : {
          origin: [config.publicUrl, /\.data\.gouv\.fr$/],
          credentials: true,
        }),
  });

  app.register(
    async (instance: Server) => {
      registerRoutes({ server: instance });
    },
    { prefix: "/api" }
  );

  app.setNotFoundHandler((_req, res) => {
    res.status(404).send(notFound("Path does not exists").output);
  });

  apiKeyUsageMiddleware(app);
  errorMiddleware(app);

  return app;
}

export default async (): Promise<Server> => {
  const app: Server = fastify({
    logger: logMiddleware(),
    trustProxy: 1,
    caseSensitive: false,
  }).withTypeProvider<ZodTypeProvider>();

  return bind(app);
};
