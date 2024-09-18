import type { IResErrorJson } from "../../models/errors/errors.model.js";
import type { PathParam, QueryString, WithQueryStringAndPathParam } from "./generateUri/generateUri.js";

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
    requestHeaders: Readonly<Headers>,
    options: WithQueryStringAndPathParam,
    res: Response
  ): Promise<ApiError> {
    let message = res.status === 0 ? "Network Error" : res.statusText;
    let name = "Api Error";
    let errorData: IResErrorJson["data"] | null = null;

    if (res.status > 0) {
      try {
        if (res.headers.get("Content-Type")?.startsWith("application/json")) {
          const data = await res.json();
          if (typeof data === "object" && data !== null) {
            name = "name" in data && typeof data.name === "string" ? data.name : "Api Error";
            message = "message" in data && typeof data.message === "string" ? data.message : `code ${res.status}`;
            errorData = "data" in data ? data.data : null;
          }
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
