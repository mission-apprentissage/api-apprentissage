import type { IApiRouteSchema, IApiRouteSchemaWrite } from "api-alternance-sdk";
import { zApiRoutesDelete, zApiRoutesGet, zApiRoutesPost, zApiRoutesPut } from "api-alternance-sdk";
import type { ConditionalExcept, EmptyObject, Jsonify } from "type-fest";
import type { z } from "zod/v4-mini";
import type { $ZodType } from "zod/v4/core";

import { zImporterAdminRoutes } from "./_private/admin/importers.admin.routes.js";
import { zOrganisationAdminRoutes } from "./_private/admin/organisation.admin.routes.js";
import { zProcessorAdminRoutes } from "./_private/admin/processor.admin.routes.js";
import { zUserAdminRoutes } from "./_private/admin/users.admin.routes.js";
import { zAuthRoutes } from "./_private/auth.routes.js";
import { zEmailRoutes } from "./_private/emails.routes.js";
import { zSimulateurRoutes } from "./_private/simulateur/simulateur.routes.js";
import { zUserRoutes } from "./_private/user.routes.js";
import { zSourceAcceRoutes } from "./experimental/source/acce.routes.js";

const zRoutesGet = {
  ...zUserAdminRoutes.get,
  ...zProcessorAdminRoutes.get,
  ...zUserRoutes.get,
  ...zAuthRoutes.get,
  ...zEmailRoutes.get,
  ...zApiRoutesGet,
  ...zSourceAcceRoutes.get,
  ...zSimulateurRoutes.get,
  ...zOrganisationAdminRoutes.get,
  ...zImporterAdminRoutes.get,
} as const;

const zRoutesPost = {
  ...zUserAdminRoutes.post,
  ...zUserRoutes.post,
  ...zAuthRoutes.post,
  ...zEmailRoutes.post,
  ...zOrganisationAdminRoutes.post,
  ...zApiRoutesPost,
} as const;

const zRoutesPut = {
  ...zUserAdminRoutes.put,
  ...zApiRoutesPut,
  ...zOrganisationAdminRoutes.put,
} as const;

const zRoutesDelete = {
  ...zUserRoutes.delete,
  ...zApiRoutesDelete,
  ...zOrganisationAdminRoutes.delete,
} as const;

export type IGetRoutes = typeof zRoutesGet;
export type IPostRoutes = typeof zRoutesPost;
export type IPutRoutes = typeof zRoutesPut;
export type IDeleteRoutes = typeof zRoutesDelete;

export type IRoutes = {
  get: IGetRoutes;
  post: IPostRoutes;
  put: IPutRoutes;
  delete: IDeleteRoutes;
};

export type IRoutesPath = {
  get: keyof IRoutes["get"];
  post: keyof IRoutes["post"];
  put: keyof IRoutes["put"];
  delete: keyof IRoutes["delete"];
};

export const zRoutes: IRoutes = {
  get: zRoutesGet,
  post: zRoutesPost,
  put: zRoutesPut,
  delete: zRoutesDelete,
} as const;

export type IResponse<S extends IApiRouteSchema> = S["response"][`200`] extends $ZodType
  ? Jsonify<z.output<S["response"][`200`]>>
  : S["response"][`2${string}`] extends $ZodType
    ? Jsonify<z.output<S["response"][`2${string}`]>>
    : never;

export type IBody<S extends IApiRouteSchemaWrite> = S["body"] extends $ZodType ? z.input<S["body"]> : never;

export type IQuery<S extends IApiRouteSchema> = S["querystring"] extends $ZodType ? z.input<S["querystring"]> : never;

export type IParam<S extends IApiRouteSchema> = S["params"] extends $ZodType ? z.input<S["params"]> : never;

type IHeadersAuth<S extends IApiRouteSchema> = S extends { securityScheme: { auth: infer A } }
  ? A extends "access-token" | "api-key"
    ? { authorization: `Bearer ${string}` }
    : object
  : object;

export type IHeaders<S extends IApiRouteSchema> = S["headers"] extends $ZodType
  ? Omit<z.input<S["headers"]>, "referrer">
  : object;

type IRequestRaw<S extends IApiRouteSchema> = {
  params: IParam<S>;
  querystring: IQuery<S>;
  headers: IHeaders<S> & IHeadersAuth<S> extends EmptyObject ? never : IHeaders<S> & IHeadersAuth<S>;
  body: S extends IApiRouteSchemaWrite ? IBody<S> : never;
  signal?: AbortSignal;
};

export type IRequest<S extends IApiRouteSchema> =
  ConditionalExcept<IRequestRaw<S>, never> extends EmptyObject ? EmptyObject : ConditionalExcept<IRequestRaw<S>, never>;

export * from "./_private/admin/importers.admin.routes.js";
