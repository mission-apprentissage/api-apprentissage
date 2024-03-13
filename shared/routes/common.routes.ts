import { oas31 } from "openapi3-ts";
import { Jsonify } from "type-fest";
import { AnyZodObject, ZodType } from "zod";

import { AccessPermission, AccessRessouces } from "../security/permissions";
import { zodOpenApi } from "../zod/zodWithOpenApi";

export const ZResError = zodOpenApi
  .object({
    data: zodOpenApi
      .any()
      .optional()
      .openapi({
        description: "Données contextuelles liées à l'erreur",
        example: {
          validationError: {
            issues: [
              {
                code: "invalid_type",
                expected: "number",
                received: "nan",
                path: ["longitude"],
                message: "Number attendu",
              },
            ],
            name: "ZodError",
            statusCode: 400,
            code: "FST_ERR_VALIDATION",
            validationContext: "querystring",
          },
        },
      }),
    code: zodOpenApi.string().nullish(),
    message: zodOpenApi.string().openapi({
      description: "Un message explicatif de l'erreur",
      example: "querystring.longitude: Number attendu",
    }),
    name: zodOpenApi.string().openapi({
      description: "Le type générique de l'erreur",
      example: "Bad Request",
    }),
    statusCode: zodOpenApi.number().openapi({
      description: "Le status code retourné",
      example: 400,
    }),
  })
  .strict();

export const ZResOk = zodOpenApi.object({}).strict();

export type IResError = zodOpenApi.input<typeof ZResError>;
export type IResErrorJson = Jsonify<zodOpenApi.output<typeof ZResError>>;

export const ZReqParamsSearchPagination = zodOpenApi
  .object({
    page: zodOpenApi.preprocess((v) => parseInt(v as string, 10), zodOpenApi.number().positive().optional()),
    limit: zodOpenApi.preprocess((v) => parseInt(v as string, 10), zodOpenApi.number().positive().optional()),
    q: zodOpenApi.string().optional(),
  })
  .strict();
export type IReqParamsSearchPagination = zodOpenApi.input<typeof ZReqParamsSearchPagination>;

export const ZReqHeadersAuthorization = zodOpenApi
  .object({
    Authorization: zodOpenApi.string().describe("Bearer token").optional(),
  })
  .passthrough();

export type AuthStrategy = "api-key" | "cookie-session" | "access-token";

export type SecuritySchemeWithAcl = {
  auth: AuthStrategy;
  access: AccessPermission;
  ressources: AccessRessouces;
};

export type SecuritySchemeNoAcl = {
  auth: AuthStrategy;
  access: null;
  ressources: Record<string, never>;
};

export type SecurityScheme = SecuritySchemeWithAcl | SecuritySchemeNoAcl;

interface IRouteSchemaCommon {
  path: string;
  querystring?: AnyZodObject;
  headers?: AnyZodObject;
  params?: AnyZodObject;
  response: { [statuscode: `${1 | 2 | 3 | 4 | 5}${string}`]: ZodType };
  openapi?: null | Omit<oas31.OperationObject, "parameters" | "requestBody" | "requestParams" | "responses">;
  securityScheme: SecurityScheme | null;
}

export interface IRouteSchemaGet extends IRouteSchemaCommon {
  method: "get";
}

export interface IRouteSchemaWrite extends IRouteSchemaCommon {
  method: "post" | "put" | "patch" | "delete";
  body?: ZodType;
}

export type WithSecurityScheme = {
  securityScheme: SecurityScheme;
};

export type IRouteSchema = IRouteSchemaGet | IRouteSchemaWrite;
export type ISecuredRouteSchema = IRouteSchema & WithSecurityScheme;

export type IRoutesDef = {
  get?: Record<string, IRouteSchemaGet>;
  post?: Record<string, IRouteSchemaWrite>;
  put?: Record<string, IRouteSchemaWrite>;
  delete?: Record<string, IRouteSchemaWrite>;
  patch?: Record<string, IRouteSchemaWrite>;
};
