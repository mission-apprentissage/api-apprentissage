import { isBoom } from "@hapi/boom";
import {
  MongoBulkWriteError,
  MongoError,
  MongoServerError,
  MongoSystemError,
  MongoWriteConcernError,
  ObjectId,
} from "mongodb";
import pino, { Logger as PinoLogger } from "pino";
import { ZodError } from "zod";

import config from "@/config";

function logFormatter(obj: unknown, seen: Set<unknown>): unknown {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof ObjectId) {
    return obj.toString();
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (seen.has(obj)) {
    return "[Circular]";
  }
  seen.add(obj);

  if (obj instanceof Error) {
    const data: Record<string, unknown> = {
      message: obj.message,
      stack: obj.stack,
      cause: logFormatter(obj.cause, seen),
    };

    if (isBoom(obj)) {
      data.isBoom = true;
      data.isServer = obj.isServer;
      data.output = obj.output;
      data.data = logFormatter(obj.data, seen);
    }

    if (obj instanceof ZodError) {
      data.data = obj.format();
    }

    if (obj instanceof MongoError) {
      data.code = obj.code;
      data.name = obj.name;
      data.errorLabels = obj.errorLabels;

      if (obj instanceof MongoServerError) {
        data.objorResponse = obj.objorResponse;
        data.codeName = obj.codeName;
        data.writeConcernError = obj.writeConcernError;
        data.ok = obj.ok;
        data.objInfo = logFormatter(obj.objInfo, seen);

        if (obj instanceof MongoBulkWriteError) {
          data.writeErrors = logFormatter(obj.writeErrors, seen);
          data.obj = logFormatter(obj.obj, seen);
        }
      }

      if (obj instanceof MongoSystemError) {
        data.reason = obj.reason;
      }

      if (obj instanceof MongoWriteConcernError) {
        data.result = logFormatter(obj.result, seen);
      }
    }

    return data;
  }

  if (Array.isArray(obj)) {
    return obj.map((e) => logFormatter(e, seen));
  }

  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      acc[key] = logFormatter(value, seen);

      return acc;
    },
    {} as Record<string, unknown>
  );
}

function getTransport() {
  if (config.log.type === "console") {
    return {
      target: "pino-pretty",
      options: {
        messageKey: "message",
        messageFormat: "{if module} [{module}] - {end} {message}",
      },
    };
  }

  return {
    target: "pino/file",
  };
}

interface ILogger {
  debug(msg: string): unknown;
  info(data: Record<string, unknown>, msg: string): unknown;
  info(msg: string): unknown;
  child(data: Record<string, unknown>): ILogger;
  error(data: Record<string, unknown>, msg: string | Error): unknown;
}

export function createJobProcessorLogger(logger: PinoLogger<never>): ILogger {
  return {
    debug(msg: string) {
      logger.debug(msg);
    },
    info(data: Record<string, unknown> | string, msg?: string) {
      logger.info(data, msg);
    },
    child(data) {
      return createJobProcessorLogger(logger.child(data));
    },
    error(data: Record<string, unknown>, msg: string | Error) {
      if (msg instanceof Error) {
        logger.error({ error: msg, data });
      } else {
        logger.error(data, msg);
      }
    },
  };
}

export default pino({
  name: config.productName,
  level: config.log.level,
  enabled: process.env.NODE_ENV !== "test",
  depthLimit: 10,
  transport: getTransport(),
  messageKey: "message",
  formatters: {
    log(data: Record<string, unknown>): Record<string, unknown> {
      return logFormatter(data, new Set()) as Record<string, unknown>;
    },
  },
});
