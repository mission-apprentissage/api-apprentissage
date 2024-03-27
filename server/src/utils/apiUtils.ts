import { createReadStream, ReadStream } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";

import { internal } from "@hapi/boom";
import { AxiosInstance } from "axios";
import { AxiosCacheInstance } from "axios-cache-interceptor";
import { RateLimiterMemory, RateLimiterQueue } from "rate-limiter-flexible";

import config from "../config";
import { withCause } from "../services/errors/withCause";
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

export async function downloadFileInTmpFile(stream: Readable, filename: string): Promise<ReadStream> {
  const tmpDir = await mkdtemp(join(tmpdir(), `api-download-${config.env}-`));

  try {
    const destFile = join(tmpDir, filename);

    await writeFile(destFile, stream);

    const readStream = createReadStream(destFile);
    readStream.once("close", async () => {
      await rm(tmpDir, { force: true, recursive: true });
    });

    return readStream;
  } catch (error) {
    await rm(tmpDir, { force: true, recursive: true });
    throw withCause(internal("api.utils: unable to download file"), error);
  }
}
