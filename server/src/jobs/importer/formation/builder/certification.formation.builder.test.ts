import { useMongo } from "@tests/mongo.test.utils.js";
import { generateCertificationFixture } from "shared/models/fixtures/certification.model.fixture";
import { beforeEach, describe, expect, it } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { buildFormationCertification } from "./certification.formation.builder.js";

useMongo();

describe("buildFormationCertification", () => {
  const certifications = [
    generateCertificationFixture({
      identifiant: {
        cfd: "46125123",
        rncp: null,
        rncp_anterieur_2019: null,
      },
      intitule: {
        cfd: {
          long: "MAINTENANCE DES INSTALLATIONS OLEOHYDRAULIQUES ET PNEUMATIQUES (CS4)",
          court: "MAINTEN.INSTAL.OLEOHYDRAU.PNEUM.",
        },
        niveau: {
          cfd: {
            europeen: "4",
            formation_diplome: "461",
            interministeriel: "4",
            libelle: "DIPLOME NATIONAL / DIPLOME D'ETAT",
            sigle: "CS4",
          },
          rncp: null,
        },
        rncp: null,
      },
      base_legale: {
        cfd: {
          creation: new Date("2023-08-24T22:00:00.000Z"),
          abrogation: null,
        },
      },
      blocs_competences: {
        rncp: null,
      },
      convention_collectives: {
        rncp: null,
      },
      domaines: {
        formacodes: {
          rncp: null,
        },
        nsf: {
          cfd: {
            code: "251",
            intitule: "MECANIQ.GENERALE & DE PRECISION, USINAGE",
          },
          rncp: null,
        },
        rome: {
          rncp: null,
        },
      },
      periode_validite: {
        debut: new Date("2026-08-31T22:00:00.000Z"),
        fin: null,
        cfd: {
          ouverture: new Date("2024-08-31T22:00:00.000Z"),
          fermeture: null,
          premiere_session: 2025,
          derniere_session: null,
        },
        rncp: null,
      },
      type: {
        nature: {
          cfd: {
            code: "1",
            libelle: "DIPLOME NATIONAL / DIPLOME D'ETAT",
          },
        },
        gestionnaire_diplome: "DGESCO A2-3",
        enregistrement_rncp: null,
        voie_acces: {
          rncp: null,
        },
        certificateurs_rncp: null,
      },
      continuite: {
        cfd: [
          {
            code: "01025116",
            ouverture: new Date("1999-08-31T22:00:00.000Z"),
            fermeture: new Date("2003-08-31T21:59:59.000Z"),
            courant: false,
          },
          {
            code: "01025123",
            ouverture: new Date("2002-08-31T22:00:00.000Z"),
            fermeture: new Date("2024-08-31T21:59:59.000Z"),
            courant: false,
          },
          {
            code: "46125123",
            ouverture: new Date("2024-08-31T22:00:00.000Z"),
            fermeture: null,
            courant: true,
          },
        ],
        rncp: null,
      },
      created_at: new Date("2025-01-02T12:09:58.075Z"),
      updated_at: new Date("2025-01-02T12:09:58.075Z"),
    }),
    generateCertificationFixture({
      identifiant: {
        rncp: "RNCP35234",
        cfd: "56T34302",
        rncp_anterieur_2019: false,
      },
      base_legale: {
        cfd: {
          creation: null,
          abrogation: new Date("2027-02-08T22:59:59.000Z"),
        },
      },
      blocs_competences: {
        rncp: [
          {
            code: "RNCP35234BC02",
            intitule: "Réaliser des opérations d'exploitation sur un site d'apport volontaire de déchets",
          },
          {
            code: "RNCP35234BC01",
            intitule: "Accueillir les usagers/clients sur un site d'apport volontaire de déchets",
          },
        ],
      },
      continuite: {
        cfd: null,
        rncp: [
          {
            code: "RNCP34501",
            activation: null,
            fin_enregistrement: new Date("2022-02-08T22:59:59.000Z"),
            courant: false,
            actif: false,
          },
          {
            code: "RNCP4794",
            activation: null,
            fin_enregistrement: new Date("2020-02-08T22:59:59.000Z"),
            courant: false,
            actif: false,
          },
          {
            code: "RNCP35234",
            activation: null,
            fin_enregistrement: new Date("2027-02-08T22:59:59.000Z"),
            courant: true,
            actif: true,
          },
        ],
      },
      convention_collectives: {
        rncp: [],
      },
      created_at: new Date("2024-12-30T10:21:44.050Z"),
      domaines: {
        formacodes: {
          rncp: [
            {
              code: "12582",
              intitule: "12582 : Gestion déchet",
            },
          ],
        },
        nsf: {
          cfd: {
            code: "343",
            intitule: "NETTOYAGE, ASSAIN., PROTECTION ENVIRONMT",
          },
          rncp: [
            {
              code: "343",
              intitule: "343 : Nettoyage, assainissement, protection de l'environnement",
            },
          ],
        },
        rome: {
          rncp: [
            {
              code: "K2304",
              intitule: "Revalorisation de produits industriels",
            },
            {
              code: "K2303",
              intitule: "Nettoyage des espaces urbains",
            },
          ],
        },
      },
      intitule: {
        cfd: {
          long: "AGENT TECHNIQUE DE RECEPTION ET DE VALORISATION DES DECHETS (TP)",
          court: "AGT TECHN RECEPT VALORISA DECHETS",
        },
        niveau: {
          cfd: {
            europeen: "3",
            formation_diplome: "56T",
            interministeriel: "5",
            libelle: "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE",
            sigle: "TH5-T",
          },
          rncp: {
            europeen: "3",
          },
        },
        rncp: "Agent technique de réception et de valorisation de déchets",
      },
      periode_validite: {
        debut: new Date("2017-07-31T22:00:00.000Z"),
        fin: new Date("2027-02-08T22:59:59.000Z"),
        cfd: {
          ouverture: new Date("2017-07-31T22:00:00.000Z"),
          fermeture: new Date("2027-08-31T21:59:59.000Z"),
          premiere_session: null,
          derniere_session: null,
        },
        rncp: {
          actif: true,
          activation: null,
          debut_parcours: new Date("2022-02-07T23:00:00.000Z"),
          fin_enregistrement: new Date("2027-02-08T22:59:59.000Z"),
        },
      },
      type: {
        nature: {
          cfd: {
            code: "2",
            libelle: "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE",
          },
        },
        gestionnaire_diplome: "DEPPA1",
        enregistrement_rncp: "Enregistrement de droit",
        voie_acces: {
          rncp: {
            apprentissage: true,
            experience: true,
            candidature_individuelle: false,
            contrat_professionnalisation: true,
            formation_continue: true,
            formation_statut_eleve: false,
          },
        },
        certificateurs_rncp: [
          {
            siret: "11000007200014",
            nom: "MINISTERE DU TRAVAIL DU PLEIN EMPLOI ET DE L' INSERTION",
          },
        ],
      },
      updated_at: new Date("2025-01-03T05:00:06.642Z"),
    }),
  ];

  beforeEach(async () => {
    await getDbCollection("certifications").insertMany(certifications);
  });

  it("should return certification when it exists in db", async () => {
    const result = await buildFormationCertification({
      cfd: certifications[1].identifiant.cfd ?? "",
      rncp_code: certifications[1].identifiant.rncp,
    });

    expect(result).toEqual({
      valeur: certifications[1],
      connue: true,
    });

    // Should be cached
    const cachedResult = await buildFormationCertification({
      cfd: certifications[1].identifiant.cfd ?? "",
      rncp_code: certifications[1].identifiant.rncp,
    });
    expect(cachedResult).toBe(result);
  });

  it("should build certification if the association is not known", async () => {
    const result = await buildFormationCertification({
      cfd: certifications[0].identifiant.cfd ?? "",
      rncp_code: certifications[1].identifiant.rncp,
    });

    expect(result.connue).toBe(false);
    expect(result.valeur).toMatchSnapshot();
  });

  it('should error if "cfd" is not found', async () => {
    await expect(
      buildFormationCertification({ cfd: "unknown", rncp_code: certifications[1].identifiant.rncp })
    ).rejects.toThrowError("getCertificationFromCfd: certification not found for code");
  });

  it('should error if "rncp" is not found', async () => {
    await expect(
      buildFormationCertification({ cfd: certifications[0].identifiant.cfd ?? "", rncp_code: "unknown" })
    ).rejects.toThrowError("getCertificationFromRncp: certification not found for code");
  });
});
