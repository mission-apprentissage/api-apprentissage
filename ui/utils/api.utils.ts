import type { IApiRouteSchema, IApiRouteSchemaWrite } from "api-alternance-sdk";
import type { PathParam, QueryString, WithQueryStringAndPathParam } from "api-alternance-sdk/internal";
import { generateUri } from "api-alternance-sdk/internal";
import type { IDeleteRoutes, IGetRoutes, IPostRoutes, IPutRoutes, IRequest, IResponse } from "shared";
import type { IResErrorJson } from "shared/routes/common.routes";
import type { EmptyObject } from "type-fest";
import type { z } from "zod/v4-mini";

import type { $ZodType } from "zod/v4/core";
import { publicConfig } from "@/config.public";

type OptionsGet = {
  [Prop in keyof Pick<IApiRouteSchema, "params" | "querystring" | "headers">]: IApiRouteSchema[Prop] extends $ZodType
    ? z.input<IApiRouteSchema[Prop]>
    : never;
};

type OptionsWrite = {
  [Prop in keyof Pick<
    IApiRouteSchemaWrite,
    "params" | "querystring" | "headers" | "body"
  >]: IApiRouteSchemaWrite[Prop] extends $ZodType ? z.input<IApiRouteSchemaWrite[Prop]> : never;
};

type IRequestOptions = OptionsGet | OptionsWrite | EmptyObject;

async function optionsToFetchParams(
  method: RequestInit["method"],
  options: IRequestOptions,
  rawOptions?: Pick<RequestInit, "cache">
) {
  const headers = await getHeaders(options);

  let body: BodyInit | undefined = undefined;
  if ("body" in options && method !== "GET") {
    // @ts-expect-error
    if (options.body instanceof FormData) {
      body = options.body;
    } else {
      body = JSON.stringify(options.body);
      headers.append("Content-Type", "application/json");
    }
  }

  const requestInit: RequestInit = {
    mode: publicConfig.env === "local" ? "cors" : "same-origin",
    credentials: publicConfig.env === "local" ? "include" : "same-origin",
    body,
    method,
    headers,
  };

  if (rawOptions) {
    Object.assign(requestInit, rawOptions);
  }

  return { requestInit, headers };
}

async function getHeaders(options: IRequestOptions) {
  const headers = new Headers();

  if ("headers" in options && options.headers) {
    const h = options.headers;
    Object.keys(h).forEach((name) => {
      headers.append(name, h[name]);
    });
  }

  try {
    if (!global.window) {
      // By default server-side we don't use headers
      // But we need them for the api, as all routes are authenticated
      const { headers: nextHeaders } = await import("next/headers");
      const h = await nextHeaders();
      const cookie = h.get("cookie");
      if (cookie) {
        headers.append("cookie", cookie);
      }
    }
  } catch (_error) {
    // We're in client, cookies will be includes
  }

  return headers;
}

const removeAtEnd = (url: string, removed: string): string =>
  url.endsWith(removed) ? url.slice(0, -removed.length) : url;

export function generateUrl(path: string, options: WithQueryStringAndPathParam = {}): string {
  const params = "params" in options ? options.params : {};
  const querystring = "querystring" in options ? options.querystring : {};
  return removeAtEnd(publicConfig.apiEndpoint, "/") + generateUri(path, { params, querystring });
}

export interface ApiErrorContext {
  path: string;
  params: PathParam;
  querystring: QueryString;
  requestHeaders: Record<string, string | string[]>;
  statusCode: number;
  message: string;
  name: string;
  responseHeaders: Record<string, string | string[]>;
  errorData: unknown;
}

export class ApiError extends Error {
  context: ApiErrorContext;

  constructor(context: ApiErrorContext) {
    super();
    this.context = context;
    this.name = context.name ?? "ApiError";
    this.message = context.message ?? `code ${context.statusCode}`;
  }

  toJSON(): ApiErrorContext {
    return this.context;
  }

  static async build(
    path: string,
    requestHeaders: Headers,
    options: WithQueryStringAndPathParam,
    res: Response
  ): Promise<ApiError> {
    let message = res.status === 0 ? "Network Error" : res.statusText;
    let name = "Api Error";
    let errorData: IResErrorJson["data"] | null = null;

    if (res.status > 0) {
      try {
        if (res.headers.get("Content-Type")?.startsWith("application/json")) {
          const data: IResErrorJson = await res.json();
          name = data.name;
          message = data.message;
          errorData = data.data;
        }
      } catch (_error) {
        // ignore
      }
    }

    return new ApiError({
      path,
      params: "params" in options && options.params ? options.params : {},
      querystring: "querystring" in options && options.querystring ? options.querystring : {},
      requestHeaders: Object.fromEntries(requestHeaders.entries()),
      statusCode: res.status,
      message,
      name,
      responseHeaders: Object.fromEntries(res.headers.entries()),
      errorData,
    });
  }
}

export async function apiPost<P extends keyof IPostRoutes, S extends IPostRoutes[P] = IPostRoutes[P]>(
  path: P,
  options: IRequest<S>
): Promise<IResponse<S>> {
  const { requestInit, headers } = await optionsToFetchParams("POST", options);

  const res = await fetch(generateUrl(path, options), requestInit);

  if (!res.ok) {
    throw await ApiError.build(path, headers, options, res);
  }

  return res.json();
}

export async function apiGet<P extends keyof IGetRoutes, S extends IGetRoutes[P] = IGetRoutes[P]>(
  path: P,
  options: IRequest<S>,
  rawOptions?: Pick<RequestInit, "cache">
): Promise<IResponse<S>> {
  const { requestInit, headers } = await optionsToFetchParams("GET", options, rawOptions);

  const res = await fetch(generateUrl(path, options), requestInit);

  if (!res.ok) {
    throw await ApiError.build(path, headers, options, res);
  }

  return res.json();
}

export async function apiPut<P extends keyof IPutRoutes, S extends IPutRoutes[P] = IPutRoutes[P]>(
  path: P,
  options: IRequest<S>
): Promise<IResponse<S>> {
  const { requestInit, headers } = await optionsToFetchParams("PUT", options);

  const res = await fetch(generateUrl(path, options), requestInit);

  if (!res.ok) {
    throw await ApiError.build(path, headers, options, res);
  }

  return res.json();
}

export async function apiDelete<P extends keyof IDeleteRoutes, S extends IDeleteRoutes[P] = IDeleteRoutes[P]>(
  path: P,
  options: IRequest<S>
): Promise<IResponse<S>> {
  const { requestInit, headers } = await optionsToFetchParams("DELETE", options);

  const res = await fetch(generateUrl(path, options), requestInit);

  if (!res.ok) {
    throw await ApiError.build(path, headers, options, res);
  }

  return res.json();
}
