import { zJobOfferCreateResponseLba } from "../../external/laBonneAlternance.api.js";
import type { IJobOfferWritable } from "../../models/index.js";
import type { IJobSearchQuery, IJobSearchResponse } from "../../routes/index.js";
import { zJobSearchResponse } from "../../routes/job.routes.js";
import type { ApiClient } from "../client.js";
import { parseApiResponse } from "../parser/response.parser.js";

export type JobSearchFilter = Omit<IJobSearchQuery, "romes"> & {
  romes?: string[];
};

export type JobModule = {
  search(filter: JobSearchFilter): Promise<IJobSearchResponse>;
  createOffer(data: IJobOfferWritable): Promise<string>;
  updateOffer(id: string, data: IJobOfferWritable): Promise<void>;
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
    createOffer: async (data: IJobOfferWritable): Promise<string> => {
      const res = await apiClient.post("/job/v1/offer", { body: data });
      return parseApiResponse(res, zJobOfferCreateResponseLba).id;
    },
    updateOffer: async (id: string, data: IJobOfferWritable): Promise<void> => {
      await apiClient.put("/job/v1/offer/:id", { params: { id }, body: data });
    },
  };
}
