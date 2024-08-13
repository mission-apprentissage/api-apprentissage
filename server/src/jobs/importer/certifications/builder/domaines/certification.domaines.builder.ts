import { ICertification } from "api-alternance-sdk";

import { ISourceAggregatedData } from "@/jobs/importer/certifications/builder/certification.builder.js";

export function buildCertificationDomaines(data: ISourceAggregatedData): ICertification["domaines"] {
  return {
    formacodes: {
      rncp:
        data.france_competence == null
          ? null
          : data.france_competence.data.formacode.map((formacode) => ({
              code: formacode.Formacode_Code ?? "",
              intitule: formacode.Formacode_Libelle,
            })),
    },
    nsf: {
      cfd:
        data.bcn == null
          ? null
          : {
              code: data.bcn.data.GROUPE_SPECIALITE,
              intitule: data.bcn.data.N_GROUPE_SPECIALITE_LIBELLE_LONG ?? null,
            },
      rncp:
        data.france_competence == null
          ? null
          : data.france_competence.data.nsf.map((nsf) => ({
              code: nsf.Nsf_Code,
              intitule: nsf.Nsf_Intitule,
            })),
    },
    rome: {
      rncp:
        data.france_competence == null
          ? null
          : data.france_competence.data.rome.map((rome) => ({
              code: rome.Codes_Rome_Code,
              intitule: rome.Codes_Rome_Libelle,
            })),
    },
  };
}
