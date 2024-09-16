import { badRequest, forbidden, internal, notFound } from "@hapi/boom";
import type { IJobSearchQuery } from "api-alternance-sdk";
import { createApiAlternanceToken } from "api-alternance-sdk";
import type {
  IJobOfferCreateResponseLba,
  IJobOfferWritableLba,
  IJobSearchResponseLba,
} from "api-alternance-sdk/internal";
import { zJobOfferCreateResponseLba, zJobSearchResponseLba } from "api-alternance-sdk/internal";
import { isAxiosError } from "axios";
import type { IOrganisation } from "shared/models/organisation.model";
import type { IUser } from "shared/models/user.model";

import config from "@/config.js";
import getApiClient from "@/services/apis/client.js";
import { withCause } from "@/services/errors/withCause.js";

const lbaClient = getApiClient({ baseURL: config.api.lba.endpoint }, { cache: false });

function hasHabilitation(
  organisation: IOrganisation | null,
  habilitation: IOrganisation["habilitations"][number]
): boolean {
  return organisation != null && organisation.habilitations.includes(habilitation);
}

export function createAuthToken(user: IUser, organisation: IOrganisation | null): string {
  const token = createApiAlternanceToken({
    data: {
      email: user.email,
      organisation: user.organisation,
      habilitations: { "jobs:write": hasHabilitation(organisation, "jobs:write") },
    },
    privateKey: config.api.alternance.private_key,
  });

  return `Bearer ${token}`;
}

function convertLbaError(error: unknown): never {
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
        throw internal("api.lba: failure convertLbaErrors", data);
    }
  }
  if (error instanceof Error) {
    throw withCause(internal("api.lba: failure convertLbaErrors"), error);
  }

  throw internal("api.lba: failure convertLbaErrors", { error });
}

export async function searchJobOpportunitiesLba(
  query: IJobSearchQuery,
  user: IUser,
  organisation: IOrganisation | null
): Promise<IJobSearchResponseLba> {
  try {
    const res = await lbaClient.get("/v2/jobs/search", {
      params: query,
      headers: {
        Authorization: createAuthToken(user, organisation),
      },
    });

    return zJobSearchResponseLba.parse(res.data);
  } catch (error) {
    convertLbaError(error);
  }
}

export async function createJobOfferLba(
  body: IJobOfferWritableLba,
  user: IUser,
  organisation: IOrganisation | null
): Promise<IJobOfferCreateResponseLba> {
  try {
    const res = await lbaClient.post("/v2/jobs", body, {
      headers: {
        Authorization: createAuthToken(user, organisation),
      },
    });

    return zJobOfferCreateResponseLba.parse(res.data);
  } catch (error) {
    convertLbaError(error);
  }
}
