import axios, { AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from "axios";
import http from "http";
import https from "https";
import iconv from "iconv-lite";
import { compose } from "oleoduc";

import logger from "@/common/logger";

// https://github.com/axios/axios/issues/3845#issuecomment-1040819908
class BufferedHttpAgent extends http.Agent {
  highWaterMark: number;

  constructor({ highWaterMark = 16 * 1024, ...rest }) {
    super(rest);

    this.highWaterMark = highWaterMark;
  }
  // @ts-expect-error: TODO
  createConnection(options, callback) {
    // @ts-expect-error
    return super.createConnection({ ...options, highWaterMark: this.highWaterMark }, callback);
  }
}
class BufferedHttpsAgent extends https.Agent {
  highWaterMark: number;

  constructor({ highWaterMark = 16 * 1024, ...rest }) {
    super(rest);
    //see https://github.com/nodejs/node/issues/39092
    this.highWaterMark = highWaterMark;
  }

  // @ts-expect-error: TODO
  createConnection(options, callback) {
    // @ts-expect-error
    return super.createConnection({ ...options, highWaterMark: this.highWaterMark }, callback);
  }
}

type FetchOptions = AxiosRequestConfig & {
  highWaterMark: number;
  raw: boolean;
  encoding: string;
};
async function _fetch(url: string, options: Partial<FetchOptions> = {}, client: AxiosInstance = axios) {
  const { method = "GET", data, highWaterMark, ...rest } = options;
  logger.debug(`${method} ${url}...`);

  return client.request({
    url,
    method,
    httpAgent: new BufferedHttpAgent({ highWaterMark }),
    httpsAgent: new BufferedHttpsAgent({ highWaterMark }),
    ...(data ? { data } : {}),
    ...rest,
  });
}

async function fetchStream(url: string, options: Partial<FetchOptions> = {}, client: AxiosInstance = axios) {
  const { raw, encoding = "UTF-8", ...rest } = options;
  const response = await _fetch(url, { responseType: "stream", ...rest }, client);

  const stream = compose(response.data, iconv.decodeStream(encoding));

  if (raw) {
    return {
      headers: response.headers,
      stream,
    };
  } else {
    return stream;
  }
}

async function fetchData(url: string, options: Partial<FetchOptions> = {}, client: AxiosInstance = axios) {
  const { raw, ...rest } = options;
  const response = await _fetch(url, { responseType: "json", ...rest }, client);
  const data = response.data;

  if (raw) {
    return {
      headers: response.headers,
      data,
    };
  } else {
    return data;
  }
}

async function fetchJson(url: string, options: Partial<FetchOptions> = {}) {
  const response = await _fetch(url, { ...options, responseType: "json" });
  return response.data;
}

function addCsvHeaders(filename: string, encoding: string, res: any) {
  res.setHeader("Content-disposition", `attachment; filename=${filename}`);
  res.setHeader("Content-Type", `text/csv; charset=${encoding}`);
}

const getHttpClient = (options: CreateAxiosDefaults<any> = {}) =>
  axios.create({
    timeout: 15000,
    httpAgent: new http.Agent({ keepAlive: true }),
    httpsAgent: new https.Agent({ keepAlive: true }),
    ...options,
  });

export { addCsvHeaders, fetchJson, fetchStream, fetchData, getHttpClient };
