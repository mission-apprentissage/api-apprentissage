import { ObjectId } from "bson";

import { ICertification } from "../certification.model";
import { getFixtureValue } from "./fixture_helper";

type ICertifBaseLegaleFixtureInput = Partial<ICertification["base_legale"]>;
type ICertifBlocsCompetencesFixtureInput = Partial<ICertification["blocs_competences"]>;
type ICertifConventionCollectivesFixtureInput = Partial<ICertification["convention_collectives"]>;
type ICertifDomainesFixtureInput = Partial<ICertification["domaines"]>;
type ICertifIdentifiantFixtureInput = Partial<ICertification["identifiant"]>;
type ICertifIntituleFixtureNiveauInput = Partial<ICertification["intitule"]["niveau"]>;
type ICertifIntituleFixtureInput = Partial<
  Omit<ICertification["intitule"], "niveau"> & { niveau: ICertifIntituleFixtureNiveauInput }
>;
type ICertifPeriodeValiditeCfdFixtureInput = Partial<ICertification["periode_validite"]["cfd"]>;
type ICertifPeriodeValiditeRncpFixtureInput = Partial<ICertification["periode_validite"]["rncp"]>;
type ICertifPeriodeValiditeFixtureInput = Omit<Partial<ICertification["periode_validite"]>, "rncp" | "cfd"> & {
  cfd?: ICertifPeriodeValiditeCfdFixtureInput;
  rncp?: ICertifPeriodeValiditeRncpFixtureInput;
};
type ICertifTypeFixtureInput = Partial<ICertification["type"]>;
type ICertifContinuiteFixtureInput = Partial<ICertification["continuite"]>;

export type ICertificationFixtureInput = {
  base_legale?: ICertifBaseLegaleFixtureInput;
  blocs_competences?: ICertifBlocsCompetencesFixtureInput;
  convention_collectives?: ICertifConventionCollectivesFixtureInput;
  domaines?: ICertifDomainesFixtureInput;
  identifiant?: ICertifIdentifiantFixtureInput;
  intitule?: ICertifIntituleFixtureInput;
  periode_validite?: ICertifPeriodeValiditeFixtureInput;
  type?: ICertifTypeFixtureInput;
  continuite?: ICertifContinuiteFixtureInput;
} & Partial<Pick<ICertification, "_id" | "created_at" | "updated_at">>;

export function generateCertifBaseLegaleFixture(data?: ICertifBaseLegaleFixtureInput): ICertification["base_legale"] {
  return {
    cfd:
      data?.cfd === null
        ? null
        : {
            creation: getFixtureValue(data?.cfd, "creation", new Date("2021-08-31T22:00:00.000Z")),
            abrogation: getFixtureValue(data?.cfd, "abrogation", new Date("2024-07-01T21:59:59.000Z")),
          },
  };
}

export function generateCertifBlocsCompetencesFixture(
  data?: ICertifBlocsCompetencesFixtureInput
): ICertification["blocs_competences"] {
  return {
    rncp:
      data?.rncp === null
        ? null
        : getFixtureValue(data, "rncp", [
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
          ]),
  };
}

export function generateCertifConventionCollectivesFixture(
  data?: ICertifConventionCollectivesFixtureInput
): ICertification["convention_collectives"] {
  return {
    rncp: data?.rncp === null ? null : getFixtureValue(data, "rncp", []),
  };
}

export function generateCertifDomainesFixture(data?: ICertifDomainesFixtureInput): ICertification["domaines"] {
  return {
    formacodes: getFixtureValue(data, "formacodes", {
      rncp: [
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
    }),
    nsf: getFixtureValue(data, "nsf", {
      cfd: {
        code: "313",
        intitule: "FINANCES, BANQUE, ASSURANCES",
      },
      rncp: [
        {
          code: "313",
          intitule: "313 : Finances, banque, assurances, immobilier",
        },
      ],
    }),
    rome: getFixtureValue(data, "rome", {
      rncp: [
        {
          code: "C1205",
          intitule: "Conseil en gestion de patrimoine financier",
        },
      ],
    }),
  };
}

export function generateCertifIdentifiantFixture(data?: ICertifIdentifiantFixtureInput): ICertification["identifiant"] {
  return {
    rncp: getFixtureValue(data, "rncp", "RNCP36629"),
    cfd: getFixtureValue(data, "cfd", "16X31336"),
    rncp_anterieur_2019: getFixtureValue(data, "rncp_anterieur_2019", true),
  };
}

export function generateCertifIntituleNiveauFixture(
  data?: ICertifIntituleFixtureNiveauInput
): ICertification["intitule"]["niveau"] {
  return {
    cfd:
      data?.cfd === null
        ? null
        : getFixtureValue(data, "cfd", {
            sigle: "TH1-X",
            europeen: "7",
            formation_diplome: "16X",
            libelle: "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE",
            interministeriel: "16X",
          }),
    rncp:
      data?.rncp === null
        ? null
        : getFixtureValue(data, "rncp", {
            europeen: "7",
          }),
  };
}

export function generateCertifIntituleFixture(data?: ICertifIntituleFixtureInput): ICertification["intitule"] {
  return {
    cfd:
      data?.cfd === null
        ? null
        : getFixtureValue(data, "cfd", {
            long: "EXPERT EN GESTION DE PATRIMOINE (IPAC)",
            court: "EXPERT EN GESTION DE PATRIMOINE",
          }),
    rncp: getFixtureValue(data, "rncp", "Expert en gestion de patrimoine"),
    niveau: generateCertifIntituleNiveauFixture(data?.niveau),
  };
}

function generateCertificationPeriodeValiditeCfdFixture(
  data?: ICertifPeriodeValiditeCfdFixtureInput
): ICertification["periode_validite"]["cfd"] {
  if (data === null) {
    return null;
  }

  return {
    ouverture: getFixtureValue(data, "ouverture", new Date("2021-08-31T22:00:00.000Z")),
    fermeture: getFixtureValue(data, "fermeture", new Date("2024-08-31T21:59:59.000Z")),
    premiere_session: getFixtureValue(data, "premiere_session", 2022),
    derniere_session: getFixtureValue(data, "derniere_session", 2024),
  };
}

function generateCertificationPeriodeValiditeRncpFixture(
  data?: ICertifPeriodeValiditeRncpFixtureInput
): ICertification["periode_validite"]["rncp"] {
  if (data === null) {
    return null;
  }

  return {
    actif: getFixtureValue(data, "actif", true),
    activation: getFixtureValue(data, "activation", new Date("2022-07-05T00:00:00.000Z")),
    fin_enregistrement: getFixtureValue(data, "fin_enregistrement", new Date("2024-06-30T21:59:59.000Z")),
    debut_parcours: getFixtureValue(data, "debut_parcours", new Date("2022-06-30T22:00:00.000Z")),
  };
}

export function generateCertificationPeriodeValiditeFixture(
  data?: ICertifPeriodeValiditeFixtureInput
): ICertification["periode_validite"] {
  return {
    debut: getFixtureValue(data, "debut", new Date("2021-08-31T22:00:00.000Z")),
    fin: getFixtureValue(data, "fin", new Date("2024-08-31T21:59:59.000Z")),
    cfd: generateCertificationPeriodeValiditeCfdFixture(data?.cfd),
    rncp: generateCertificationPeriodeValiditeRncpFixture(data?.rncp),
  };
}

export function generateCertifTypeFixture(data?: ICertifTypeFixtureInput): ICertification["type"] {
  return {
    certificateurs_rncp: getFixtureValue(data, "certificateurs_rncp", [
      { siret: "11000007200014", nom: "MINISTERE DU TRAVAIL DU PLEIN EMPLOI ET DE L' INSERTION" },
    ]),
    enregistrement_rncp: getFixtureValue(data, "enregistrement_rncp", "Enregistrement sur demande"),
    gestionnaire_diplome: getFixtureValue(data, "gestionnaire_diplome", "DEPPA1"),
    voie_acces: getFixtureValue(data, "voie_acces", {
      rncp: {
        apprentissage: true,
        experience: true,
        candidature_individuelle: true,
        contrat_professionnalisation: true,
        formation_continue: true,
        formation_statut_eleve: true,
      },
    }),
    nature: getFixtureValue(data, "nature", {
      cfd: {
        code: "2",
        libelle: "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE",
      },
    }),
  };
}

export function generateCertifContinuiteFixture(
  self: Pick<ICertification, "identifiant" | "periode_validite">,
  data?: ICertifContinuiteFixtureInput
): ICertification["continuite"] {
  return {
    cfd: getFixtureValue(
      data,
      "cfd",
      self.identifiant.cfd === null
        ? null
        : [
            {
              code: self.identifiant.cfd,
              ouverture: self.periode_validite.cfd?.ouverture ?? null,
              fermeture: self.periode_validite.cfd?.fermeture ?? null,
              courant: true,
            },
          ]
    ),
    rncp: getFixtureValue(
      data,
      "rncp",
      self.identifiant.rncp === null
        ? null
        : [
            {
              code: self.identifiant.rncp,
              activation: self.periode_validite.rncp?.activation ?? null,
              fin_enregistrement: self.periode_validite.rncp?.fin_enregistrement ?? null,
              courant: true,
              actif: self.periode_validite.rncp?.actif ?? false,
            },
          ]
    ),
  };
}

export function generateCertificationFixture(data?: ICertificationFixtureInput): ICertification {
  const identifiant = generateCertifIdentifiantFixture(data?.identifiant);
  const periode_validite = generateCertificationPeriodeValiditeFixture(data?.periode_validite);

  return {
    _id: getFixtureValue(data, "_id", new ObjectId()),
    base_legale: generateCertifBaseLegaleFixture(data?.base_legale),
    blocs_competences: generateCertifBlocsCompetencesFixture(data?.blocs_competences),
    convention_collectives: generateCertifConventionCollectivesFixture(data?.convention_collectives),
    domaines: generateCertifDomainesFixture(data?.domaines),
    identifiant,
    intitule: generateCertifIntituleFixture(data?.intitule),
    periode_validite,
    type: generateCertifTypeFixture(data?.type),
    continuite: generateCertifContinuiteFixture({ identifiant, periode_validite }, data?.continuite),
    created_at: getFixtureValue(data, "created_at", new Date("2021-08-31T22:00:00.000Z")),
    updated_at: getFixtureValue(data, "updated_at", new Date("2021-08-31T22:00:00.000Z")),
  };
}
