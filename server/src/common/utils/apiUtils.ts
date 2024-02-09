import { AxiosInstance } from "axios";
import { AxiosCacheInstance } from "axios-cache-interceptor";
import { RateLimiterMemory, RateLimiterQueue } from "rate-limiter-flexible";

import config from "../../config";
import { timeout } from "./asyncUtils";

interface ApiRateLimiterOptions {
  nbRequests?: number;
  durationInSeconds?: number;
  maxQueueSize?: number;
  timeout?: number;
  client: AxiosInstance | AxiosCacheInstance;
}

export type ApiRateLimiterFn = <T>(callback: (i: AxiosInstance | AxiosCacheInstance) => T) => Promise<T>;

export const apiRateLimiter = (name: string, options: ApiRateLimiterOptions): ApiRateLimiterFn => {
  const rateLimiter = new RateLimiterMemory({
    keyPrefix: name,
    points: options.nbRequests ?? 1,
    duration: options.durationInSeconds ?? 1,
  });

  const queue = new RateLimiterQueue(rateLimiter, {
    maxQueueSize: options.maxQueueSize ?? 25,
  });

  return async (callback) => {
    if (config.env !== "test") {
      // Do not rate limit tests
      await timeout(queue.removeTokens(1), options.timeout ?? 10_000);
    }
    return callback(options.client);
  };
};
