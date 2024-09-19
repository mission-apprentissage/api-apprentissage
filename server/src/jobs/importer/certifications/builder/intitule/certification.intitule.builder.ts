import { internal } from "@hapi/boom";
import type { ICertification } from "api-alternance-sdk";
import type { INiveauDiplomeEuropeen } from "api-alternance-sdk/internal";
import type { IBcn_N_NiveauFormationDiplome } from "shared/models/source/bcn/bcn.n_niveau_formation_diplome.model";

import type { ISourceAggregatedData } from "@/jobs/importer/certifications/builder/certification.builder.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

function parseRncpNiveauEuropeen(value: string | null): INiveauDiplomeEuropeen | null {
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

function parseCfdNiveauEuropeen(value: string | null): INiveauDiplomeEuropeen | null {
  if (value === null) {
    return null;
  }

  switch (value) {
    case "01":
      return "1";
    case "02":
      return "2";
    case "03":
      return "3";
    case "04":
      return "4";
    case "05":
      return "5";
    case "06":
      return "6";
    case "07":
      return "7";
    case "08":
      return "8";
    case "00":
    case "99":
    case "XX":
      return null;
    default:
      throw internal("import.certifications: unexpected niveau europeen value", { value });
  }
}

function getNiveauInterministerielFromFormationDiplome(value: string): string {
  // You can get interministeriel value from the first character of the formation diplome value
  // Except for the value "013" which should return "5"
  // We also validate this rule everytime we import the data
  if (value === "013") {
    return "5";
  }

  return value.charAt(0);
}

export async function validateNiveauFormationDiplomeToInterministerielRule(): Promise<undefined> {
  const list = await getDbCollection("source.bcn")
    .find<IBcn_N_NiveauFormationDiplome>({
      source: "N_NIVEAU_FORMATION_DIPLOME",
    })
    .toArray();

  const invalid = list.filter(
    (item) =>
      getNiveauInterministerielFromFormationDiplome(item.data.NIVEAU_FORMATION_DIPLOME ?? "") !==
      item.data.NIVEAU_INTERMINISTERIEL
  );

  if (invalid.length > 0) {
    throw internal("import.certifications: invalid niveau formation diplome to interministeriel rule", {
      invalid,
    });
  }
}

export function buildCertificationIntitule(data: ISourceAggregatedData): ICertification["intitule"] {
  const cfdData = data.bcn?.data ?? null;
  const rncpData = data.france_competence?.data?.standard ?? null;

  return {
    cfd:
      cfdData == null
        ? null
        : {
            court: cfdData.LIBELLE_STAT_33,
            long: cfdData.LIBELLE_LONG_200,
          },
    rncp: rncpData?.Intitule ?? null,
    niveau: {
      cfd:
        cfdData == null
          ? null
          : {
              sigle: cfdData.LIBELLE_COURT,
              europeen: parseCfdNiveauEuropeen(cfdData.NIVEAU_QUALIFICATION_RNCP),
              formation_diplome: cfdData.NIVEAU_FORMATION_DIPLOME,
              libelle: cfdData.N_NATURE_FORMATION_DIPLOME_LIBELLE_100,
              interministeriel: getNiveauInterministerielFromFormationDiplome(cfdData.NIVEAU_FORMATION_DIPLOME),
            },
      rncp:
        rncpData == null
          ? null
          : {
              europeen: parseRncpNiveauEuropeen(rncpData.Nomenclature_Europe_Niveau),
            },
    },
  };
}
