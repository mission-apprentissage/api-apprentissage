import type { EmptyObject } from "type-fest";
import type { z, ZodType } from "zod";

import type { IApiRouteSchema, IApiRouteSchemaWrite } from "../routes/common.routes.js";
import type {
  IApiDeleteRoutes,
  IApiGetRoutes,
  IApiPostRoutes,
  IApiPutRoutes,
  IApiRequest,
  IApiResponse,
} from "../routes/index.js";
import { ApiError } from "./internal/apiError.js";
import type { CertificationModule } from "./internal/certification/certification.module.js";
import { buildCertificationModule } from "./internal/certification/certification.module.js";
import type { FormationModule } from "./internal/formation/formation.module.js";
import { buildFormationModule } from "./internal/formation/formation.module.js";
import type { WithQueryStringAndPathParam } from "./internal/generateUri/generateUri.js";
import { generateUri } from "./internal/generateUri/generateUri.js";
import type { GeographieModule } from "./internal/geographie/geographie.module.js";
import { buildGeographieModule } from "./internal/geographie/geographie.module.js";
import type { OrganismeModule } from "./internal/organisme/organisme.module.js";
import { buildOrganismeModule } from "./internal/organisme/organisme.module.js";

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

type ApiClientConfig = {
  endpoint?: string;
  key: string;
};

class ApiClient {
  endpoint: string;
  key: string;

  certification: CertificationModule;
  geographie: GeographieModule;
  organisme: OrganismeModule;
  formation: FormationModule;

  constructor(config: ApiClientConfig) {
    this.endpoint = removeAtEnd(config.endpoint ?? "https://api.apprentissage.beta.gouv.fr/api", "/");
    this.key = config.key ?? throwError("api-alternance-sdk: api key is required");

    this.certification = buildCertificationModule(this);
    this.geographie = buildGeographieModule(this);
    this.organisme = buildOrganismeModule(this);
    this.formation = buildFormationModule(this);
  }

  private buildRequestInit(
    method: RequestInit["method"],
    options: IRequestOptions,
    rawOptions?: FetchOptions
  ): RequestInit {
    const headers = new Headers();
    headers.set("authorization", `Bearer ${this.key}`);

    if ("headers" in options && options.headers) {
      const h = options.headers;
      Object.keys(h).forEach((name) => {
        headers.set(name, h[name]);
      });
    }

    let body: RequestInit["body"] | undefined = undefined;
    if ("body" in options && method !== "GET") {
      // @ts-expect-error
      if (options.body instanceof FormData) {
        body = options.body;
      } else {
        body = JSON.stringify(options.body);
        headers.set("content-Type", "application/json");
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
    const reqHeaders = Array.from((requestInit.headers as Headers)?.entries() ?? []);
    const res = await fetch(this.endpoint + generateUri(path, options), requestInit);

    if (!res.ok) {
      throw await ApiError.build(path, new Headers(reqHeaders), options, res);
    }

    if (res.status === 204) {
      return;
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

export type { ApiClientConfig };
export { ApiClient };
