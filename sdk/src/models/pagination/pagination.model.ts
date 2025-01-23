import { z } from "zod";

export const zPaginationQuery = z.object({
  page_size: z.number().int().min(1).max(1_000).default(100),
  page_index: z.number().int().min(0).default(0),
});

export const zPaginationInfo = z
  .object({
    page_count: z.number().int(),
    page_size: z.number().int(),
    page_index: z.number().int(),
  })
  .openapi("Pagination");

export type IPaginationQuery = z.output<typeof zPaginationQuery>;

export type IPaginationInfo = z.output<typeof zPaginationInfo>;

export type IPaginationResult<T> = {
  data: T[];
  pagination: IPaginationInfo;
};
