import { internal } from "@hapi/boom";
import { ICertification, ICertificationInput, zCertification } from "shared/models/certification.model";
import { IBcn_N_FormationDiplome } from "shared/models/source/bcn/bcn.n_formation_diplome.model";
import { IBcn_N51_FormationDiplome } from "shared/models/source/bcn/bcn.n51_formation_diplome.model";
import { IBcn_V_FormationDiplome } from "shared/models/source/bcn/bcn.v_formation_diplome.model";
import { INiveauDiplomeEuropeen } from "shared/zod/certifications.primitives";
import { parseNullableParisLocalDate } from "shared/zod/date.primitives";

import { withCause } from "../../../../../common/errors/withCause";
import { getDbCollection } from "../../../../../common/utils/mongodbUtils";

function parseNiveauEuropeen(value: string | null): INiveauDiplomeEuropeen | null {
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

export async function buildNiveauEuropeenToInterministerielMap(): Promise<Map<INiveauDiplomeEuropeen | null, string>> {
  const list = await getDbCollection("source.bcn")
    .aggregate<{ NIVEAU_QUALIFICATION_RNCP: string; NIVEAU_INTERMINISTERIEL: string }>([
      {
        $match: {
          source: "N_NIVEAU_FORMATION_DIPLOME",
          "data.NIVEAU_QUALIFICATION_RNCP": {
            $nin: ["00", "XX", "99"],
          },
        },
      },
      {
        $group: {
          _id: "$data.NIVEAU_QUALIFICATION_RNCP",
          NIVEAU_INTERMINISTERIEL: {
            $first: "$data.NIVEAU_INTERMINISTERIEL",
          },
        },
      },
      {
        $project: {
          _id: 0,
          NIVEAU_QUALIFICATION_RNCP: "$_id",
          NIVEAU_INTERMINISTERIEL: 1,
        },
      },
    ])
    .toArray();

  const result: Map<INiveauDiplomeEuropeen | null, string> = new Map();
  for (const item of list) {
    result.set(parseNiveauEuropeen(item.NIVEAU_QUALIFICATION_RNCP), item.NIVEAU_INTERMINISTERIEL);
  }

  return result;
}

export function buildCertificationCfd(
  data?: Array<IBcn_N_FormationDiplome | IBcn_N51_FormationDiplome | IBcn_V_FormationDiplome> | null | undefined
): ICertification["cfd"] {
  const nFormation = data?.find((item) => item.source === "N_FORMATION_DIPLOME") ?? null;
  const n51Formation = data?.find((item) => item.source === "N_FORMATION_DIPLOME_ENQUETE_51") ?? null;
  const vFormation = data?.find((item) => item.source === "V_FORMATION_DIPLOME") ?? null;

  if (vFormation === null) {
    return null;
  }

  if (nFormation === null && n51Formation === null) {
    throw internal("import.certifications: no N_FORMATION_DIPLOME or N_FORMATION_DIPLOME_ENQUETE_51 found");
  }

  try {
    const rawData: ICertificationInput["cfd"] = {
      ouverture: parseNullableParisLocalDate(vFormation.data.DATE_OUVERTURE, "00:00:00"),
      fermeture: parseNullableParisLocalDate(vFormation.data.DATE_FERMETURE, "23:59:59"),
      creation: parseNullableParisLocalDate(vFormation.data.DATE_ARRETE_CREATION, "00:00:00"),
      abrogation: parseNullableParisLocalDate(vFormation.data.DATE_ARRETE_ABROGATION, "23:59:59"),
      domaine: vFormation.data.GROUPE_SPECIALITE,
      intitule: {
        court: vFormation.data.LIBELLE_STAT_33,
        long: vFormation.data.LIBELLE_LONG_200,
      },
      nature: {
        code: vFormation.data.NATURE_FORMATION_DIPLOME ?? null,
        libelle: vFormation.data.N_NATURE_FORMATION_DIPLOME_LIBELLE_100 ?? null,
      },
      gestionnaire: vFormation.data.GESTIONNAIRE_FORMATION_DIPLOME ?? null,
      session: {
        premiere: vFormation.data.DATE_PREMIERE_SESSION ? Number(vFormation.data.DATE_PREMIERE_SESSION) : null,
        fin: vFormation.data.DATE_DERNIERE_SESSION ? Number(vFormation.data.DATE_DERNIERE_SESSION) : null,
      },
      niveau: {
        sigle: vFormation.data.LIBELLE_COURT,
        europeen: parseNiveauEuropeen(vFormation.data.NIVEAU_QUALIFICATION_RNCP),
        formation_diplome: vFormation.data.NIVEAU_FORMATION_DIPLOME,
        intitule: vFormation.data.N_NATURE_FORMATION_DIPLOME_LIBELLE_100,
        interministeriel: vFormation.data.NIVEAU_FORMATION_DIPLOME,
      },
      nsf: [
        {
          code: vFormation.data.GROUPE_SPECIALITE,
          intitule: vFormation.data.N_GROUPE_SPECIALITE_LIBELLE_LONG ?? null,
        },
      ],
    };

    return zCertification.shape.cfd.parse(rawData);
  } catch (error) {
    throw withCause(
      internal("import.certifications: error while building certification CFD", {
        cfd: vFormation.data.FORMATION_DIPLOME,
      }),
      error
    );
  }
}
