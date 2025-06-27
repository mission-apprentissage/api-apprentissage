import { z } from "zod/v4-mini";

export const zPaginationQuery = z.object({
  page_size: z._default(z.coerce.number().check(z.int(), z.gte(1), z.lte(1_000)), 100),
  page_index: z._default(z.coerce.number().check(z.int(), z.gte(0)), 0),
});

export const zPaginationInfo = z.object({
  page_count: z.int().check(z.gte(0)),
  page_size: z.int().check(z.gte(1), z.lte(1_000)),
  page_index: z.int().check(z.gte(0)),
});

export type IPaginationQuery = z.output<typeof zPaginationQuery>;

export type IPaginationInfo = z.output<typeof zPaginationInfo>;

export type IPaginationResult<T> = {
  data: T[];
  pagination: IPaginationInfo;
};
