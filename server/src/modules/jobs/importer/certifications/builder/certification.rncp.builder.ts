import { internal } from "@hapi/boom";
import { ICertificationInput, zCertification } from "shared/models/certification.model";
import { ISourceFranceCompetence } from "shared/models/source/france_competence/source.france_competence.model";
import { INiveauDiplomeEuropeen } from "shared/zod/certifications.primitives";
import { parseNullableParisLocalDate } from "shared/zod/date.primitives";

import { withCause } from "../../../../../common/errors/withCause";
import { INiveauInterministerielSearchMap } from "./certification.cfd.builder";

function parseNiveauEuropeen(value: string | null): INiveauDiplomeEuropeen | null {
  if (value === null) {
    return null;
  }

  switch (value) {
    case "NIV3":
      return "3";
    case "NIV4":
      return "4";
    case "NIV5":
      return "5";
    case "NIV6":
      return "6";
    case "NIV7":
      return "7";
    case "NIV8":
      return "8";
    case "REPRISE":
      return null;
    default:
      throw internal("import.certifications: unexpected niveau europeen value", { value });
  }
}

function getDateActivation(data: ISourceFranceCompetence, oldestFranceCompetenceDatePublication: Date) {
  if (data.date_premiere_activation === null) {
    return null;
  }

  return data.date_premiere_activation.getTime() > oldestFranceCompetenceDatePublication.getTime()
    ? data.date_premiere_activation
    : null;
}

export function buildCertificationRncp(
  data: ISourceFranceCompetence | null | undefined,
  oldestFranceCompetenceDatePublication: Date,
  niveauInterministerielSearchMap: INiveauInterministerielSearchMap
): ICertificationInput["rncp"] {
  try {
    if (data == null) {
      return null;
    }

    const standard = data.data.standard ?? null;

    if (standard === null) {
      return null;
    }

    const rawData: ICertificationInput["rncp"] = {
      actif: standard.Actif === "ACTIVE",
      activation: getDateActivation(data, oldestFranceCompetenceDatePublication),
      fin_enregistrement: parseNullableParisLocalDate(standard.Date_Fin_Enregistrement, "23:59:59", -1),
      debut_parcours:
        parseNullableParisLocalDate(standard.Date_Effet, "00:00:00") ??
        parseNullableParisLocalDate(standard.Date_Decision, "00:00:00"),
      intitule: standard.Intitule,
      blocs: data.data.blocs_de_competences.map((bloc) => ({
        code: bloc.Bloc_Competences_Code,
        intitule: bloc.Bloc_Competences_Libelle,
      })),
      rome: data.data.rome.map((rome) => ({
        code: rome.Codes_Rome_Code,
        intitule: rome.Codes_Rome_Libelle,
      })),
      formacodes: data.data.formacode.map((formacode) => ({
        code: formacode.Formacode_Code ?? "",
        intitule: formacode.Formacode_Libelle,
      })),
      convention_collectives: data.data.ccn.flatMap((ccn) => {
        const result = [];

        if (ccn.Ccn_1_Numero !== null || ccn.Ccn_1_Libelle !== null) {
          result.push({
            numero: ccn.Ccn_1_Numero ?? "",
            intitule: ccn.Ccn_1_Libelle ?? "",
          });
        }

        if (ccn.Ccn_2_Numero !== null || ccn.Ccn_2_Libelle !== null) {
          result.push({
            numero: ccn.Ccn_2_Numero ?? "",
            intitule: ccn.Ccn_2_Libelle ?? "",
          });
        }

        if (ccn.Ccn_3_Numero !== null || ccn.Ccn_3_Libelle !== null) {
          result.push({
            numero: ccn.Ccn_3_Numero ?? "",
            intitule: ccn.Ccn_3_Libelle ?? "",
          });
        }

        return result;
      }),
      niveau: {
        europeen: parseNiveauEuropeen(standard.Nomenclature_Europe_Niveau),
        interministeriel:
          niveauInterministerielSearchMap.fromEuropeen.get(parseNiveauEuropeen(standard.Nomenclature_Europe_Niveau)) ??
          null,
      },
      nsf: data.data.nsf.map((nsf) => ({
        code: nsf.Nsf_Code,
        intitule: nsf.Nsf_Intitule,
      })),
      enregistrement: standard.Type_Enregistrement,
    };

    return zCertification.shape.rncp.parse(rawData);
  } catch (error) {
    throw withCause(
      internal("import.certifications: failed to build certification RNCP", { numero_fiche: data?.numero_fiche, data }),
      error
    );
  }
}
