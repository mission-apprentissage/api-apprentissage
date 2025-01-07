import { internal } from "@hapi/boom";
import type { ICertification, IFormation } from "api-alternance-sdk";
import { LRUCache } from "lru-cache";
import { stringify } from "safe-stable-stringify";
import type { IFormationCatalogue } from "shared/models/source/catalogue/source.catalogue.model";

import { computePeriodeValidite } from "@/jobs/importer/certifications/builder/periode_validite/certification.periode_validite.builder.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

const cache = new LRUCache<string, IFormation["certification"]>({
  max: 5_000,
  ttl: 60 * 60_000,
});

async function getCertificationFromRncp(code: string | null): Promise<ICertification | null> {
  if (!code || code === "RNCPNR") {
    return null;
  }

  const certification = await getDbCollection("certifications").findOne({ "identifiant.rncp": code });

  if (!certification) {
    throw internal(`getCertificationFromRncp: certification not found for code`, { code });
  }

  return certification;
}

async function getCertificationFromCfd(code: string): Promise<ICertification> {
  const certification = await getDbCollection("certifications").findOne({ "identifiant.cfd": code });

  if (!certification) {
    throw internal(`getCertificationFromCfd: certification not found for code`, { code });
  }

  return certification;
}

export async function buildFormationCertification(
  data: Pick<IFormationCatalogue, "rncp_code" | "cfd">
): Promise<IFormation["certification"]> {
  const identifiant = {
    rncp: data.rncp_code,
    cfd: data.cfd,
  };

  const cacheKey = stringify(identifiant);

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const certification = await getDbCollection("certifications").findOne({
    "identifiant.rncp": identifiant.rncp,
    "identifiant.cfd": identifiant.cfd,
  });

  if (certification) {
    const result = {
      valeur: certification,
      connue: true,
    };

    cache.set(cacheKey, result);
    return result;
  }

  const [rncpCertif, cfdCertif] = await Promise.all([
    getCertificationFromRncp(data.rncp_code),
    getCertificationFromCfd(data.cfd),
  ]);

  const result = {
    valeur: {
      identifiant: {
        rncp: rncpCertif?.identifiant.rncp ?? null,
        cfd: cfdCertif.identifiant.cfd,
        rncp_anterieur_2019: rncpCertif?.identifiant.rncp_anterieur_2019 ?? null,
      },
      intitule: {
        cfd: cfdCertif.intitule.cfd,
        rncp: rncpCertif?.intitule.rncp ?? null,
        niveau: {
          cfd: cfdCertif.intitule.niveau.cfd,
          rncp: rncpCertif?.intitule.niveau.rncp ?? null,
        },
      },
      base_legale: {
        cfd: cfdCertif.base_legale.cfd,
      },
      blocs_competences: {
        rncp: rncpCertif?.blocs_competences.rncp ?? null,
      },
      convention_collectives: {
        rncp: rncpCertif?.convention_collectives.rncp ?? null,
      },
      domaines: {
        formacodes: {
          rncp: rncpCertif?.domaines.formacodes.rncp ?? null,
        },
        nsf: {
          cfd: cfdCertif.domaines.nsf.cfd,
          rncp: rncpCertif?.domaines.nsf.rncp ?? null,
        },
        rome: {
          rncp: rncpCertif?.domaines.rome.rncp ?? null,
        },
      },
      periode_validite: computePeriodeValidite(
        cfdCertif.periode_validite.cfd,
        rncpCertif?.periode_validite.rncp ?? null
      ),
      type: {
        nature: {
          cfd: cfdCertif.type.nature.cfd,
        },
        gestionnaire_diplome: cfdCertif.type.gestionnaire_diplome,
        enregistrement_rncp: rncpCertif?.type.enregistrement_rncp ?? null,
        voie_acces: {
          rncp: rncpCertif?.type.voie_acces.rncp ?? null,
        },
        certificateurs_rncp: rncpCertif?.type.certificateurs_rncp ?? null,
      },
      continuite: {
        cfd: cfdCertif.continuite.cfd,
        rncp: rncpCertif?.continuite.rncp ?? null,
      },
    },
    connue: false,
  };

  cache.set(cacheKey, result);
  return result;
}
