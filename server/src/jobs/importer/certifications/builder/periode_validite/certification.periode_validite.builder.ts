import type { ICertification } from "api-alternance-sdk";
import type { IBcn_N_FormationDiplome } from "shared/models/source/bcn/bcn.n_formation_diplome.model";
import type { IBcn_N51_FormationDiplome } from "shared/models/source/bcn/bcn.n51_formation_diplome.model";
import type { ISourceFranceCompetence } from "shared/models/source/france_competence/source.france_competence.model";
import { parseNullableParisLocalDate } from "shared/zod/date.primitives";

import type { ISourceAggregatedData } from "@/jobs/importer/certifications/builder/certification.builder.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export function computePeriodeValidite(
  cfd: ICertification["periode_validite"]["cfd"],
  rncp: ICertification["periode_validite"]["rncp"]
): ICertification["periode_validite"] {
  const ouverture = cfd?.ouverture ?? null;
  const activation = rncp?.activation ?? null;

  let debut: Date | null = ouverture ?? activation;

  if (ouverture != null && activation != null) {
    debut = ouverture > activation ? ouverture : activation;
  }

  const fermeture = cfd?.fermeture ?? null;
  const finEnregistrement = rncp?.fin_enregistrement ?? null;

  let fin: Date | null = fermeture ?? finEnregistrement;
  if (fermeture != null && finEnregistrement != null) {
    fin = fermeture < finEnregistrement ? fermeture : finEnregistrement;
  }

  return {
    debut,
    fin,
    cfd,
    rncp,
  };
}

function buildCertificationPeriodeValiditeCfd(
  formation: IBcn_N_FormationDiplome | IBcn_N51_FormationDiplome | null | undefined
): ICertification["periode_validite"]["cfd"] {
  if (formation == null) {
    return null;
  }

  return {
    ouverture: parseNullableParisLocalDate(formation.data.DATE_OUVERTURE, "00:00:00"),
    fermeture: parseNullableParisLocalDate(formation.data.DATE_FERMETURE, "23:59:59"),
    premiere_session: formation.data.DATE_PREMIERE_SESSION ? Number(formation.data.DATE_PREMIERE_SESSION) : null,
    derniere_session: formation.data.DATE_DERNIERE_SESSION ? Number(formation.data.DATE_DERNIERE_SESSION) : null,
  };
}

function getRncpDateActivation(data: ISourceFranceCompetence, oldestFranceCompetenceDatePublication: Date) {
  if (data.date_premiere_activation === null) {
    return null;
  }

  return data.date_premiere_activation.getTime() > oldestFranceCompetenceDatePublication.getTime()
    ? data.date_premiere_activation
    : null;
}

function buildCertificationPeriodeValiditeRncp(
  data: ISourceFranceCompetence | null | undefined,
  oldestFranceCompetenceDatePublication: Date
): ICertification["periode_validite"]["rncp"] {
  if (data == null) {
    return null;
  }

  const standard = data.data.standard ?? null;

  if (standard === null) {
    return null;
  }

  return {
    actif: standard.Actif === "ACTIVE",
    activation: getRncpDateActivation(data, oldestFranceCompetenceDatePublication),
    fin_enregistrement: parseNullableParisLocalDate(standard.Date_Fin_Enregistrement, "23:59:59"),
    debut_parcours:
      parseNullableParisLocalDate(standard.Date_Effet, "00:00:00") ??
      parseNullableParisLocalDate(standard.Date_Decision, "00:00:00"),
  };
}

export type ICertificationSearchMap = {
  cfd: Record<string, ICertification["periode_validite"]["cfd"]>;
  rncp: Record<string, ICertification["periode_validite"]["rncp"]>;
};

export async function buildCertificationSearchMap(
  oldestFranceCompetenceDatePublication: Date
): Promise<ICertificationSearchMap> {
  const [bcn, franceCompetence] = await Promise.all([
    getDbCollection("source.bcn")
      .find<IBcn_N_FormationDiplome | IBcn_N51_FormationDiplome>({
        source: {
          $in: ["N_FORMATION_DIPLOME", "N_FORMATION_DIPLOME_ENQUETE_51"],
        },
      })
      .toArray(),
    getDbCollection("source.france_competence")
      .find({
        numero_fiche: /^RNCP/,
        // On filtre les fiches eligible en apprentissage ou professionnalisation
        "data.voies_d_acces.Si_Jury": {
          $in: ["En contrat d’apprentissage", "En contrat de professionnalisation"],
        },
      })
      .toArray(),
  ]);

  return {
    cfd: bcn.reduce<ICertificationSearchMap["cfd"]>((acc, item) => {
      acc[item.data.FORMATION_DIPLOME] = buildCertificationPeriodeValiditeCfd(item);
      return acc;
    }, {}),
    rncp: franceCompetence.reduce<ICertificationSearchMap["rncp"]>((acc, item) => {
      acc[item.numero_fiche] = buildCertificationPeriodeValiditeRncp(item, oldestFranceCompetenceDatePublication);
      return acc;
    }, {}),
  };
}

export function buildCertificationPeriodeValidite(
  data: ISourceAggregatedData,
  oldestFranceCompetenceDatePublication: Date
): ICertification["periode_validite"] {
  const cfd = buildCertificationPeriodeValiditeCfd(data.bcn);
  const rncp = buildCertificationPeriodeValiditeRncp(data.france_competence, oldestFranceCompetenceDatePublication);

  return computePeriodeValidite(cfd, rncp);
}
