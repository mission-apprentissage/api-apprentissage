import type { ConditionalExcept, EmptyObject, Jsonify } from "type-fest";
import { z, ZodType } from "zod";

import { IApiRouteSchema, IApiRouteSchemaWrite } from "./common.routes.js";
import { zApiOrganismesRoutes } from "./organisme.routes.js";

export * from "./common.routes.js";
export type * from "./common.routes.js";

export * from "./errors.routes.js";
export type * from "./errors.routes.js";

export * from "./organisme.routes.js";
export type * from "./organisme.routes.js";

const zApiRoutesGet = {
  ...zApiOrganismesRoutes.get,
} as const;

const zApiRoutesPost = {} as const;

const zApiRoutesPut = {} as const;

const zApiRoutesDelete = {} as const;

export type IApiGetRoutes = typeof zApiRoutesGet;
export type IApiPostRoutes = typeof zApiRoutesPost;
export type IApiPutRoutes = typeof zApiRoutesPut;
export type IApiDeleteRoutes = typeof zApiRoutesDelete;

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
  ConditionalExcept<IRequestRaw<S>, never | EmptyObject> extends EmptyObject
    ? EmptyObject
    : ConditionalExcept<IRequestRaw<S>, never | EmptyObject>;
