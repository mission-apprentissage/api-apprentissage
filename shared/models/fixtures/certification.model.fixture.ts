import { ObjectId } from "bson";

import { ICertification } from "../certification.model";
import { getFixtureValue } from "./fixture_helper";

export function generateCertificationFixture(data?: Partial<ICertification>): ICertification {
  return {
    _id: getFixtureValue(data, "_id", new ObjectId()),
    code: {
      cfd: getFixtureValue(data?.code, "cfd", "16X31336"),
      rncp: getFixtureValue(data?.code, "rncp", "RNCP36629"),
    },
    cfd: {
      ouverture: new Date("2021-08-31T22:00:00.000Z"),
      fermeture: new Date("2024-08-31T21:59:59.000Z"),
      creation: null,
      abrogation: new Date("2024-07-01T21:59:59.000Z"),
      domaine: "313",
      intitule: {
        long: "EXPERT EN GESTION DE PATRIMOINE (IPAC)",
        court: "EXPERT EN GESTION DE PATRIMOINE",
      },
      nature: {
        code: "2",
        libelle: "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE",
      },
      gestionnaire: "DEPPA1",
      session: {
        premiere: null,
        fin: null,
      },
      niveau: {
        sigle: "TH1-X",
        europeen: "7",
        formation_diplome: "16X",
        intitule: "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE",
        interministeriel: "16X",
      },
      nsf: [
        {
          code: "313",
          intitule: "FINANCES, BANQUE, ASSURANCES",
        },
      ],
    },
    periode_validite: {
      debut: new Date("2021-08-31T22:00:00.000Z"),
      fin: new Date("2024-08-31T21:59:59.000Z"),
    },
    rncp: {
      actif: true,
      activation: new Date("2022-07-05T00:00:00.000Z"),
      fin_enregistrement: new Date("2024-06-30T21:59:59.000Z"),
      debut_parcours: new Date("2022-06-30T22:00:00.000Z"),
      intitule: "Expert en gestion de patrimoine",
      blocs: [
        {
          code: "RNCP36629BC01",
          intitule:
            "Analyser et diagnostiquer les besoins du client en matière de gestion de patrimoine privé ou professionnel",
        },
        {
          code: "RNCP36629BC02",
          intitule: "Conseiller et commercialiser des montages d’ingénierie patrimoniale privée ou professionnelle",
        },
        {
          code: "RNCP36629BC03",
          intitule: "Créer son cabinet, développer et pérenniser son portefeuille client privé ou professionnel",
        },
        {
          code: "RNCP36629BC04",
          intitule:
            "Suivre les réglementations et les procédures d’éthique et de déontologie financières en matière de conseil patrimonial privé ou professionnel",
        },
      ],
      rome: [
        {
          code: "C1205",
          intitule: "Conseil en gestion de patrimoine financier",
        },
      ],
      formacodes: [
        {
          code: "41014",
          intitule: "41014 : Gestion patrimoine",
        },
        {
          code: "41007",
          intitule: "41007 : Gestion actifs",
        },
        {
          code: "41003",
          intitule: "41003 : Gestion portefeuille",
        },
        {
          code: "42133",
          intitule: "42133 : Gestion immobilière",
        },
      ],
      convention_collectives: [],
      niveau: {
        europeen: "7",
        interministeriel: "1",
      },
      nsf: [
        {
          code: "313",
          intitule: "313 : Finances, banque, assurances, immobilier",
        },
      ],
      enregistrement: "Enregistrement sur demande",
    },
    created_at: getFixtureValue(data, "created_at", new Date("2024-03-07T09:32:27.104Z")),
    updated_at: getFixtureValue(data, "updated_at", new Date("2024-03-07T09:32:27.104Z")),
  };
}
