import type { ICertification } from "api-alternance-sdk";

import type { ISourceAggregatedData } from "@/jobs/importer/certifications/builder/certification.builder.js";

export function buildCertificationBlocsCompetences(data: ISourceAggregatedData): ICertification["blocs_competences"] {
  return {
    rncp:
      data.france_competence == null
        ? null
        : data.france_competence.data.blocs_de_competences.map((bloc) => ({
            code: bloc.Bloc_Competences_Code,
            intitule: bloc.Bloc_Competences_Libelle,
          })),
  };
}
