import { badRequest, forbidden, internal, notFound } from "@hapi/boom";
import type { IJobSearchQuery } from "api-alternance-sdk";
import { createApiAlternanceToken } from "api-alternance-sdk";
import type { IJobSearchResponseLba } from "api-alternance-sdk/internal";
import { zJobSearchResponseLba } from "api-alternance-sdk/internal";
import { isAxiosError } from "axios";
import type { IUser } from "shared/models/user.model";

import config from "@/config.js";
import getApiClient from "@/services/apis/client.js";
import { withCause } from "@/services/errors/withCause.js";

const lbaClient = getApiClient({ baseURL: config.api.lba.endpoint }, { cache: false });

export function createAuthToken(user: IUser): string {
  const token = createApiAlternanceToken({
    data: {
      email: user.email,
      organisation: user.organisation,
      habilitations: { "jobs:write": false },
    },
    privateKey: config.api.alternance.private_key,
  });

  return `Bearer ${token}`;
}

export async function searchJobOpportunitiesLba(query: IJobSearchQuery, user: IUser): Promise<IJobSearchResponseLba> {
  try {
    const res = await lbaClient.get("/v2/jobs/search", {
      params: query,
      headers: {
        Authorization: createAuthToken(user),
      },
    });

    return zJobSearchResponseLba.parse(res.data);
  } catch (error) {
    if (isAxiosError(error)) {
      const data = error.response?.data ?? null;

      switch (error.response?.status) {
        case 400:
          throw badRequest(data.message, data.data);
        case 403:
          throw forbidden(data.message, data.data);
        case 404:
          throw notFound(data.message, data.data);
        default:
          throw internal("api.lba: failure searchJobOpportunities", data);
      }
    }
    throw withCause(internal("api.lba: failure searchJobOpportunities"), error);
  }
}
