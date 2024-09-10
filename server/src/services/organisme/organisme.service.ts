import { captureException } from "@sentry/node";
import type { IRechercheOrganismeResponse, IRechercheOrganismeResultat } from "api-alternance-sdk";
import type { Filter } from "mongodb";
import type { ISourceReferentiel } from "shared/models/source/referentiel/source.referentiel.model";

import { getEtablissementDiffusible } from "@/services/apis/entreprise/entreprise.js";
import logger from "@/services/logger.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export type OrganismeSearchQuery = {
  uai: string | null;
  siret: string | null;
};

async function findReferentielOrganismes({ uai, siret }: OrganismeSearchQuery): Promise<ISourceReferentiel[]> {
  const criteria: Filter<ISourceReferentiel>[] = [];

  if (siret) {
    criteria.push({ "data.siret": siret });
    criteria.push({ "data.relations.siret": siret });
  }

  if (uai) {
    criteria.push({ "data.uai": uai });
    criteria.push({ "data.lieux_de_formation.uai": uai });
  }

  return await getDbCollection("source.referentiel")
    .find({ $or: criteria }, { sort: { "data.siret": 1, "data.uai": 1 } })
    .toArray();
}

function applySearch(
  { uai, siret }: OrganismeSearchQuery,
  organismeReferentiel: ISourceReferentiel
): IRechercheOrganismeResultat {
  return {
    status: {
      ouvert: organismeReferentiel.data.etat_administratif === "actif",
      declaration_catalogue: organismeReferentiel.data.nature !== "inconnue",
      validation_uai: organismeReferentiel.data.uai != null,
    },
    correspondances: {
      uai:
        uai === null
          ? null
          : {
              lui_meme: organismeReferentiel.data.uai === uai,
              son_lieu: organismeReferentiel.data.lieux_de_formation.some((lieu) => lieu.uai === uai),
            },
      siret:
        siret === null
          ? null
          : {
              lui_meme: organismeReferentiel.data.siret === siret,
              son_formateur:
                organismeReferentiel.data.relations?.some(
                  (relation) => relation.siret === siret && relation.type === "responsable->formateur"
                ) ?? false,
              son_responsable:
                organismeReferentiel.data.relations?.some(
                  (relation) => relation.siret === siret && relation.type === "formateur->responsable"
                ) ?? false,
            },
    },
    organisme: {
      identifiant: {
        uai: organismeReferentiel.data.uai ?? null,
        siret: organismeReferentiel.data.siret,
      },
    },
  };
}

export async function searchOrganismeMetadata({
  uai,
  siret,
}: OrganismeSearchQuery): Promise<IRechercheOrganismeResponse["metadata"]> {
  const metadata: IRechercheOrganismeResponse["metadata"] = {
    uai: null,
    siret: null,
  };

  const [uaiReferentiel, siretReferentiel] = await Promise.all([
    uai === null
      ? null
      : getDbCollection("source.referentiel").findOne({
          $or: [{ "data.uai": uai }, { "data.lieux_de_formation.uai": uai }],
        }),
    siret === null ? null : getDbCollection("source.referentiel").findOne({ "data.siret": siret }),
  ]);

  if (uai) {
    metadata.uai = { status: uaiReferentiel ? "ok" : "inconnu" };
  }

  if (siret) {
    if (siretReferentiel) {
      metadata.siret = { status: siretReferentiel.data.etat_administratif === "actif" ? "ok" : "fermé" };
    } else {
      const etablissement = await getEtablissementDiffusible(siret).catch((e) => {
        logger.error(e);
        captureException(e);
        return null;
      });

      if (etablissement) {
        metadata.siret = { status: etablissement.etat_administratif === "A" ? "ok" : "fermé" };
      } else {
        metadata.siret = { status: "inconnu" };
      }
    }
  }

  return metadata;
}

export async function searchOrganisme({
  uai,
  siret,
}: OrganismeSearchQuery): Promise<Omit<IRechercheOrganismeResponse, "metadata">> {
  if (!uai && !siret) {
    return {
      resultat: null,
      candidats: [],
    };
  }

  const organismeReferentiels = await findReferentielOrganismes({ uai, siret });

  const organismes = organismeReferentiels.map((organismeReferentiel) =>
    applySearch({ uai, siret }, organismeReferentiel)
  );

  const candidats: Set<IRechercheOrganismeResultat> = new Set();

  const buildResponse = (resultat: IRechercheOrganismeResultat | null) => {
    if (resultat) {
      candidats.delete(resultat);
    }
    return { resultat, candidats: Array.from(candidats) };
  };

  const bySiretAndUai =
    organismes.find((o) => o.correspondances.uai?.lui_meme && o.correspondances.siret?.lui_meme) ?? null;
  const exists = bySiretAndUai !== null;

  if (exists && bySiretAndUai.status.ouvert) {
    return {
      resultat: bySiretAndUai,
      candidats: Array.from(candidats),
    };
  } else if (bySiretAndUai) {
    if (bySiretAndUai.correspondances.uai?.son_lieu) {
      return buildResponse(bySiretAndUai);
    }
    candidats.add(bySiretAndUai);
  }

  const bySiret = organismes.filter((o) => o.correspondances.siret?.lui_meme && !o.correspondances.uai?.lui_meme);
  const byUai = organismes.filter((o) => o.correspondances.uai?.lui_meme && !o.correspondances.siret?.lui_meme);
  const byUaiLieu = organismes.filter(
    (o) => o.correspondances.uai?.son_lieu && o.status.ouvert && o.status.validation_uai
  );

  if (bySiret.length === 0) {
    if (byUai.length > 0) {
      byUai.forEach((c) => candidats.add(c));

      const byUaiOuvert = byUai.filter((o) => o.status.ouvert && o.status.declaration_catalogue);

      if (byUaiOuvert.length === 0) {
        return buildResponse(null);
      }

      if (byUaiOuvert.length === 1) {
        return buildResponse(byUaiOuvert[0]);
      }

      const byUaiAndUaiLieu = byUaiOuvert.filter((o) => o.correspondances.uai?.son_lieu);
      if (byUaiAndUaiLieu.length === 1) {
        return buildResponse(byUaiAndUaiLieu[0]);
      }

      return buildResponse(null);
    }

    if (byUaiLieu.length === 1) {
      return buildResponse(byUaiLieu[0]);
    }

    byUaiLieu.forEach((c) => candidats.add(c));

    return buildResponse(null);
  }

  bySiret.forEach((c) => candidats.add(c));
  byUai.forEach((c) => candidats.add(c));

  if (bySiret.length > 1) {
    return buildResponse(null);
  }

  if (bySiret[0].correspondances.uai === null || bySiret[0].correspondances.uai.son_lieu) {
    return buildResponse(bySiret[0]);
  }

  if (byUaiLieu.length === 1) {
    return buildResponse(
      byUaiLieu[0].correspondances.uai?.lui_meme || !byUaiLieu[0].correspondances.siret?.son_responsable
        ? byUaiLieu[0]
        : bySiret[0]
    );
  }

  byUaiLieu.forEach((c) => candidats.add(c));

  return buildResponse(null);
}
