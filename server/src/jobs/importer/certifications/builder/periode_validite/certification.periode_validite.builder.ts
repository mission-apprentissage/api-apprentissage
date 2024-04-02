import { ICertification } from "shared/models/certification.model";
import { IBcn_V_FormationDiplome } from "shared/models/source/bcn/bcn.v_formation_diplome.model";
import { ISourceFranceCompetence } from "shared/models/source/france_competence/source.france_competence.model";
import { parseNullableParisLocalDate } from "shared/zod/date.primitives";

import { ISourceAggregatedData } from "../certification.builder";

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
  vFormation: IBcn_V_FormationDiplome | null | undefined
): ICertification["periode_validite"]["cfd"] {
  if (vFormation == null) {
    return null;
  }

  return {
    ouverture: parseNullableParisLocalDate(vFormation.data.DATE_OUVERTURE, "00:00:00"),
    fermeture: parseNullableParisLocalDate(vFormation.data.DATE_FERMETURE, "23:59:59"),
    premiere_session: vFormation.data.DATE_PREMIERE_SESSION ? Number(vFormation.data.DATE_PREMIERE_SESSION) : null,
    derniere_session: vFormation.data.DATE_DERNIERE_SESSION ? Number(vFormation.data.DATE_DERNIERE_SESSION) : null,
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

export function buildCertificationPeriodeValidite(
  data: ISourceAggregatedData,
  oldestFranceCompetenceDatePublication: Date
): ICertification["periode_validite"] {
  const cfd = buildCertificationPeriodeValiditeCfd(data.bcn);
  const rncp = buildCertificationPeriodeValiditeRncp(data.france_competence, oldestFranceCompetenceDatePublication);

  return computePeriodeValidite(cfd, rncp);
}
