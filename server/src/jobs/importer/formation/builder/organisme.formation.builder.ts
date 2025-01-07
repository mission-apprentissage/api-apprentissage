import type { IFormation, IOrganisme } from "api-alternance-sdk";
import { zSiret, zUai } from "api-alternance-sdk";
import { LRUCache } from "lru-cache";
import { stringify } from "safe-stable-stringify";

import { buildOrganisme, buildOrganismeContext } from "@/jobs/importer/organisme/builder/organisme.builder.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

const cache = new LRUCache<string, Promise<IFormation["formateur"]>>({
  max: 5_000,
  ttl: 60 * 60_000,
});

async function buildFormationOrganismeRaw(identifiant: IOrganisme["identifiant"]): Promise<IFormation["formateur"]> {
  const organisme = await getDbCollection("organisme").findOne({
    "identifiant.siret": identifiant.siret,
    "identifiant.uai": identifiant.uai?.toUpperCase() ?? null,
  });

  if (organisme) {
    return {
      organisme: organisme,
      connu: true,
    };
  }

  const bySiret = await getDbCollection("organisme").findOne({
    "identifiant.siret": identifiant.siret,
  });

  if (bySiret) {
    return {
      organisme: bySiret,
      connu: true,
    };
  }

  if (!zSiret.safeParse(identifiant.siret).success) {
    return {
      organisme: null,
      connu: false,
    };
  }
  const context = await buildOrganismeContext(identifiant.siret);

  if (!context) {
    return {
      organisme: null,
      connu: false,
    };
  }

  return {
    organisme: buildOrganisme(
      {
        siret: identifiant.siret,
        uai: zUai.safeParse(identifiant.uai).success ? identifiant.uai : null,
      },
      context,
      "supprimé"
    ),
    connu: false,
  };
}

export async function buildFormationOrganisme(
  identifiant: IOrganisme["identifiant"]
): Promise<IFormation["formateur"]> {
  const cacheKey = stringify(identifiant);
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const result = buildFormationOrganismeRaw(identifiant);
  cache.set(cacheKey, result);
  return result;
}
