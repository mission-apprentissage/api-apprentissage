import type { Jsonify } from "type-fest";
import { z } from "zod/v4-mini";

export const zResBadRequest = z.strictObject({
  data: z.optional(z.any()),
  message: z.string(),
  name: z.string(),
  statusCode: z.literal(400),
});

export const zResUnauthorized = z.strictObject({
  data: z.optional(z.any()),
  message: z.string(),
  name: z.string(),
  statusCode: z.literal(401),
});

export const zResForbidden = z.strictObject({
  data: z.optional(z.any()),
  message: z.string(),
  name: z.string(),
  statusCode: z.literal(403),
});

export const zResNotFound = z.strictObject({
  data: z.optional(z.any()),
  message: z.string(),
  name: z.string(),
  statusCode: z.literal(404),
});

export const zResConflict = z.strictObject({
  data: z.optional(z.any()),
  message: z.string(),
  name: z.string(),
  statusCode: z.literal(409),
});

export const zResTooManyRequest = z.strictObject({
  data: z.optional(z.any()),
  message: z.string(),
  name: z.string(),
  statusCode: z.literal(419),
});

export const zResInternalServerError = z.strictObject({
  data: z.optional(z.any()),
  message: z.string(),
  name: z.string(),
  statusCode: z.literal(500),
});

export const zResBadGateway = z.strictObject({
  data: z.optional(z.any()),
  message: z.string(),
  name: z.string(),
  statusCode: z.literal(502),
});

export const zResServiceUnavailable = z.strictObject({
  data: z.optional(z.any()),
  message: z.string(),
  name: z.string(),
  statusCode: z.literal(502),
});

export const ZResError = z.strictObject({
  data: z.optional(z.any()),
  code: z.nullish(z.string()),
  message: z.string(),
  name: z.string(),
  statusCode: z.number(),
});

export type IResError = z.input<typeof ZResError>;
export type IResErrorJson = Jsonify<z.output<typeof ZResError>>;
