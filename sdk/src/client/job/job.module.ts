import type { IJobSearchQuery, IJobSearchResponse } from "../../routes/index.js";
import { zJobSearchResponse } from "../../routes/index.js";
import type { ApiClient } from "../client.js";
import { parseApiResponse } from "../parser/response.parser.js";

export type JobSearchFilter = Omit<IJobSearchQuery, "romes"> & {
  romes?: string[];
};

export type JobModule = {
  search(filter: JobSearchFilter): Promise<IJobSearchResponse>;
};

export function buildJobModule(apiClient: ApiClient): JobModule {
  return {
    search: async (filter: JobSearchFilter): Promise<IJobSearchResponse> => {
      const { romes, ...rest } = filter;
      const querystring: IJobSearchQuery = {
        ...rest,
      };

      if (romes) {
        querystring.romes = romes.join(",");
      }

      const data = await apiClient.get("/job/v1/search", { querystring });

      return parseApiResponse(data, zJobSearchResponse);
    },
  };
}
