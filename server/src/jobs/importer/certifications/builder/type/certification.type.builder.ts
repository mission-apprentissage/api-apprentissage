import { internal } from "@hapi/boom";
import { ICertification } from "api-alternance-sdk";

import { ISourceAggregatedData } from "@/jobs/importer/certifications/builder/certification.builder.js";

export function buildCertificationType(data: ISourceAggregatedData): ICertification["type"] {
  const cfdData = data.bcn?.data ?? null;
  const rncpData = data.france_competence?.data ?? null;

  return {
    certificateurs_rncp:
      rncpData?.certificateurs.map((certificateur) => ({
        siret: certificateur.Siret_Certificateur,
        nom: certificateur.Nom_Certificateur,
      })) ?? null,
    enregistrement_rncp: rncpData?.standard?.Type_Enregistrement ?? null,
    gestionnaire_diplome: cfdData?.GESTIONNAIRE_FORMATION_DIPLOME ?? null,
    nature: {
      cfd:
        cfdData === null
          ? null
          : {
              code: cfdData.NATURE_FORMATION_DIPLOME ?? null,
              libelle: cfdData.N_NATURE_FORMATION_DIPLOME_LIBELLE_100 ?? null,
            },
    },
    voie_acces: {
      rncp:
        rncpData === null
          ? null
          : rncpData.voies_d_acces.reduce(
              (acc, voie) => {
                if (voie.Si_Jury === "En contrat d’apprentissage") {
                  acc.apprentissage = true;
                } else if (voie.Si_Jury === "Par expérience") {
                  acc.experience = true;
                } else if (voie.Si_Jury === "Par candidature individuelle") {
                  acc.candidature_individuelle = true;
                } else if (voie.Si_Jury === "En contrat de professionnalisation") {
                  acc.contrat_professionnalisation = true;
                } else if (voie.Si_Jury === "Après un parcours de formation continue") {
                  acc.formation_continue = true;
                } else if (voie.Si_Jury === "Après un parcours de formation sous statut d’élève ou d’étudiant") {
                  acc.formation_statut_eleve = true;
                } else {
                  throw internal("import.certifications: unexpected voie d'acces value", { voie });
                }

                return acc;
              },
              {
                apprentissage: false as boolean,
                experience: false as boolean,
                candidature_individuelle: false as boolean,
                contrat_professionnalisation: false as boolean,
                formation_continue: false as boolean,
                formation_statut_eleve: false as boolean,
              }
            ),
    },
  };
}
