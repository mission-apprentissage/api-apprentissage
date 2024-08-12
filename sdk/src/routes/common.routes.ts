import { AnyZodObject, ZodType } from "zod";

interface IApiRouteSchemaCommon {
  path: string;
  querystring?: AnyZodObject;
  headers?: AnyZodObject;
  params?: AnyZodObject;
  response: { [statuscode: `${1 | 2 | 3 | 4 | 5}${string}`]: ZodType };
}

export interface IApiRouteSchemaGet extends IApiRouteSchemaCommon {
  method: "get";
}

export interface IApiRouteSchemaWrite extends IApiRouteSchemaCommon {
  method: "post" | "put" | "patch" | "delete";
  body?: ZodType;
}

export type IApiRouteSchema = IApiRouteSchemaGet | IApiRouteSchemaWrite;

export type IApiRoutesDef = {
  get?: Record<string, IApiRouteSchemaGet>;
  post?: Record<string, IApiRouteSchemaWrite>;
  put?: Record<string, IApiRouteSchemaWrite>;
  delete?: Record<string, IApiRouteSchemaWrite>;
  patch?: Record<string, IApiRouteSchemaWrite>;
};
