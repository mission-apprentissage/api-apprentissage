import { internal } from "@hapi/boom";
import { createApiAlternanceToken } from "api-alternance-sdk";
import type { FastifyReply } from "fastify";
import type { IOrganisation } from "shared/models/organisation.model";
import type { IUser } from "shared/models/user.model";

import config from "@/config.js";
import { withCause } from "@/services/errors/withCause.js";

type ForwardApiRequestConfig = {
  endpoint: string;
  path: string;
  querystring?: string;
  requestInit: RequestInit;
};

type Identity = {
  user: IUser;
  organisation: IOrganisation | null;
};

function hasHabilitation(
  organisation: IOrganisation | null,
  habilitation: IOrganisation["habilitations"][number]
): boolean {
  return organisation != null && organisation.habilitations.includes(habilitation);
}

export function createAuthToken({ user, organisation }: Identity, expiresIn: string | null = null): string {
  const token = createApiAlternanceToken({
    data: {
      email: user.email,
      organisation: user.organisation,
      habilitations: {
        "jobs:write": hasHabilitation(organisation, "jobs:write"),
        "applications:write": hasHabilitation(organisation, "applications:write"),
        "appointments:write": hasHabilitation(organisation, "appointments:write"),
      },
    },
    privateKey: config.api.alternance.private_key,
    expiresIn,
  });

  return `Bearer ${token}`;
}

async function getResponse(request: ForwardApiRequestConfig, identity: Identity): Promise<Response> {
  try {
    const url = request.endpoint + request.path + (request.querystring ?? "");

    const headers =
      request.requestInit instanceof Headers ? request.requestInit : new Headers(request.requestInit.headers);
    headers.append("Authorization", createAuthToken(identity));

    const response = await fetch(url, { ...request.requestInit, headers });

    if (response.status === 401) {
      throw internal("forwardApi.getResponse: unauthorized", {
        headers: response.headers,
        data: await response.text(),
        request,
      });
    }

    return response;
  } catch (error) {
    throw withCause(internal("forwardApi.getResponse: unexpected error", { request }), error);
  }
}

export async function forwardApiRequest(
  request: ForwardApiRequestConfig,
  reply: FastifyReply,
  identity: Identity
): Promise<FastifyReply> {
  const response = await getResponse(request, identity);

  return reply.send(response);
}
