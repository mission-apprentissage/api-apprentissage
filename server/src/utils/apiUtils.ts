import { createHash } from "node:crypto";
import { createReadStream, ReadStream } from "node:fs";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

import { internal } from "@hapi/boom";
import { AxiosInstance } from "axios";
import { AxiosCacheInstance } from "axios-cache-interceptor";
import { RateLimiterMemory, RateLimiterQueue } from "rate-limiter-flexible";

import config from "@/config";
import { withCause } from "@/services/errors/withCause";

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

export async function downloadFileAsTmp(stream: Readable, filename: string): Promise<string> {
  const tmpDir = await mkdtemp(join(tmpdir(), `api-download-${config.env}-`));

  try {
    const destFile = join(tmpDir, filename);

    await writeFile(destFile, stream);

    return destFile;
  } catch (error) {
    await rm(tmpDir, { force: true, recursive: true });
    throw withCause(internal("api.utils.downloadFileAsTmp: unable to download file"), error);
  }
}

export async function readTmpAsStreamAndCleanup(filePath: string): Promise<ReadStream> {
  try {
    const readStream = createReadStream(filePath);
    readStream.once("close", async () => {
      await cleanupTmp(filePath);
    });

    return readStream;
  } catch (error) {
    await cleanupTmp(filePath);
    throw withCause(internal("api.utils: unable to read downloaded file"), error);
  }
}

export async function cleanupTmp(filePath: string): Promise<void> {
  await rm(dirname(filePath), { force: true, recursive: true });
}

export async function downloadFileAsStream(stream: Readable, filename: string): Promise<ReadStream> {
  const destFile = await downloadFileAsTmp(stream, filename);
  return readTmpAsStreamAndCleanup(destFile);
}

export async function computeFileHash(stream: Readable): Promise<string> {
  const hash = createHash("sha256");

  await pipeline(stream, hash);

  return hash.digest("hex");
}
