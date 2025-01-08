import type { ConditionalExcept, EmptyObject, Jsonify } from "type-fest";
import type { z, ZodType } from "zod";

import { zApiCertificationsRoutes } from "./certification.routes.js";
import type { IApiRouteSchema, IApiRouteSchemaWrite } from "./common.routes.js";
import { zApiFormationRoutes } from "./formation.routes.js";
import { zApiGeographieRoutes } from "./geographie.routes.js";
import { zApiJobRoutes } from "./jobs/job.routes.js";
import { zApiOrganismesRoutes } from "./organisme.routes.js";

export * from "./common.routes.js";
export * from "./certification.routes.js";
export * from "./geographie.routes.js";
export * from "./formation.routes.js";
export * from "./jobs/job.routes.js";
export * from "./organisme.routes.js";

const _zApiRoutesGet = {
  ...zApiOrganismesRoutes.get,
  ...zApiCertificationsRoutes.get,
  ...zApiJobRoutes.get,
  ...zApiGeographieRoutes.get,
  ...zApiFormationRoutes.get,
} as const;

const _zApiRoutesPost = {
  ...zApiJobRoutes.post,
} as const;

const _zApiRoutesPut = {
  ...zApiJobRoutes.put,
} as const;

const _zApiRoutesDelete = {} as const;

export type IApiGetRoutes = typeof _zApiRoutesGet;
export type IApiPostRoutes = typeof _zApiRoutesPost;
export type IApiPutRoutes = typeof _zApiRoutesPut;
export type IApiDeleteRoutes = typeof _zApiRoutesDelete;

export type IApiResponse<S extends IApiRouteSchema> = S["response"][`200`] extends ZodType
  ? Jsonify<z.output<S["response"][`200`]>>
  : S["response"][`2${string}`] extends ZodType
    ? Jsonify<z.output<S["response"][`2${string}`]>>
    : never;

export type IApiBody<S extends IApiRouteSchemaWrite> = S["body"] extends ZodType ? z.input<S["body"]> : never;

export type IApiQuery<S extends IApiRouteSchema> = S["querystring"] extends ZodType ? z.input<S["querystring"]> : never;

export type IApiParam<S extends IApiRouteSchema> = S["params"] extends ZodType ? z.input<S["params"]> : never;

export type IApiHeaders<S extends IApiRouteSchema> = S["headers"] extends ZodType
  ? Omit<z.input<S["headers"]>, "referrer">
  : object;

type IRequestRaw<S extends IApiRouteSchema> = {
  params: IApiParam<S>;
  querystring: IApiQuery<S>;
  headers: IApiHeaders<S> extends EmptyObject ? never : IApiHeaders<S>;
  body: S extends IApiRouteSchemaWrite ? IApiBody<S> : never;
  signal?: AbortSignal;
};

export type IApiRequest<S extends IApiRouteSchema> =
  ConditionalExcept<IRequestRaw<S>, never> extends EmptyObject ? EmptyObject : ConditionalExcept<IRequestRaw<S>, never>;
