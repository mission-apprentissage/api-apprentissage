import { EmptyObject } from "type-fest";
import z, { ZodType } from "zod";

import { IApiRouteSchema, IApiRouteSchemaWrite } from "../routes/common.routes.js";
import {
  IApiDeleteRoutes,
  IApiGetRoutes,
  IApiPostRoutes,
  IApiPutRoutes,
  IApiRequest,
  IApiResponse,
} from "../routes/index.js";
import { ApiError } from "./apiError.js";
import { generateUri, WithQueryStringAndPathParam } from "./generateUri/generateUri.js";

type OptionsGet = {
  [Prop in keyof Pick<IApiRouteSchema, "params" | "querystring" | "headers">]: IApiRouteSchema[Prop] extends ZodType
    ? z.input<IApiRouteSchema[Prop]>
    : never;
};

type OptionsWrite = {
  [Prop in keyof Pick<
    IApiRouteSchemaWrite,
    "params" | "querystring" | "headers" | "body"
  >]: IApiRouteSchemaWrite[Prop] extends ZodType ? z.input<IApiRouteSchemaWrite[Prop]> : never;
};

type IRequestOptions = OptionsGet | OptionsWrite | EmptyObject;

type FetchOptions = Omit<RequestInit, "body" | "method" | "headers">;

const removeAtEnd = (url: string, removed: string): string =>
  url.endsWith(removed) ? url.slice(0, -removed.length) : url;

function throwError(message: string): never {
  throw new Error(message);
}

export type ApiClientConfig = {
  endpoint?: string;
  key: string;
};

export class ApiClient {
  endpoint: string;

  key: string;

  constructor(config: ApiClientConfig) {
    this.endpoint = removeAtEnd(config.endpoint ?? "https://api.apprentissage.beta.gouv.fr/api", "/");
    this.key = config.key ?? throwError("api-alternance-sdk: api key is required");
  }

  private buildRequestInit(
    method: RequestInit["method"],
    options: IRequestOptions,
    rawOptions?: FetchOptions
  ): RequestInit {
    const headers = new Headers();
    headers.append("Authorization", `Bearer ${this.key}`);

    if ("headers" in options && options.headers) {
      const h = options.headers;
      Object.keys(h).forEach((name) => {
        headers.append(name, h[name]);
      });
    }

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
      body,
      method,
      headers,
    };

    if (rawOptions) {
      Object.assign(requestInit, rawOptions);
    }

    return requestInit;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async exec(path: string, requestInit: RequestInit, options: WithQueryStringAndPathParam): Promise<any> {
    const res = await fetch(this.endpoint + generateUri(path, options), requestInit);

    if (!res.ok) {
      throw await ApiError.build(path, new Headers(requestInit.headers), options, res);
    }

    return res.json();
  }

  async get<P extends keyof IApiGetRoutes, S extends IApiGetRoutes[P] = IApiGetRoutes[P]>(
    path: P,
    options: IApiRequest<S>,
    rawOptions?: FetchOptions
  ): Promise<IApiResponse<S>> {
    const requestInit = this.buildRequestInit("GET", options, rawOptions);
    return this.exec(path, requestInit, options);
  }

  async post<P extends keyof IApiPostRoutes, S extends IApiPostRoutes[P] = IApiPostRoutes[P]>(
    path: P,
    options: IApiRequest<S>,
    rawOptions?: FetchOptions
  ): Promise<IApiResponse<S>> {
    const requestInit = this.buildRequestInit("POST", options, rawOptions);
    return this.exec(path, requestInit, options);
  }

  async put<P extends keyof IApiPutRoutes, S extends IApiPutRoutes[P] = IApiPutRoutes[P]>(
    path: P,
    options: IApiRequest<S>,
    rawOptions?: FetchOptions
  ): Promise<IApiResponse<S>> {
    const requestInit = this.buildRequestInit("PUT", options, rawOptions);
    return this.exec(path, requestInit, options);
  }

  async delete<P extends keyof IApiDeleteRoutes, S extends IApiDeleteRoutes[P] = IApiDeleteRoutes[P]>(
    path: P,
    options: IApiRequest<S>,
    rawOptions?: FetchOptions
  ): Promise<IApiResponse<S>> {
    const requestInit = this.buildRequestInit("DELETE", options, rawOptions);
    return this.exec(path, requestInit, options);
  }
}
