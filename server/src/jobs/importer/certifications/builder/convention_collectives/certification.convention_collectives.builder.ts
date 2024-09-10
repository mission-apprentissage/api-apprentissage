import type { ICertification } from "api-alternance-sdk";

import type { ISourceAggregatedData } from "@/jobs/importer/certifications/builder/certification.builder.js";

export function buildCertificationConventionCollectives(
  data: ISourceAggregatedData
): ICertification["convention_collectives"] {
  return {
    rncp:
      data.france_competence == null
        ? null
        : data.france_competence.data.ccn.flatMap((ccn) => {
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
  };
}
