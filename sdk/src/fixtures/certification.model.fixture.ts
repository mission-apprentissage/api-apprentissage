import type { ICertification } from "../models/index.js";

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
};

export function generateCertifBaseLegaleFixture(data?: ICertifBaseLegaleFixtureInput): ICertification["base_legale"] {
  return {
    cfd: {
      creation: new Date("2021-08-31T22:00:00.000Z"),
      abrogation: new Date("2024-07-01T21:59:59.000Z"),
      ...data?.cfd,
    },
  };
}

export function generateCertifBlocsCompetencesFixture(
  data?: ICertifBlocsCompetencesFixtureInput
): ICertification["blocs_competences"] {
  return {
    rncp: [
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
    ...data,
  };
}

export function generateCertifConventionCollectivesFixture(
  data?: ICertifConventionCollectivesFixtureInput
): ICertification["convention_collectives"] {
  return {
    rncp: [],
    ...data,
  };
}

export function generateCertifDomainesFixture(data?: ICertifDomainesFixtureInput): ICertification["domaines"] {
  return {
    formacodes: {
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
      ...data?.formacodes,
    },
    nsf: {
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
      ...data?.nsf,
    },
    rome: {
      rncp: [
        {
          code: "C1205",
          intitule: "Conseil en gestion de patrimoine financier",
        },
      ],
      ...data?.rome,
    },
  };
}

export function generateCertifIdentifiantFixture(data?: ICertifIdentifiantFixtureInput): ICertification["identifiant"] {
  return {
    rncp: "RNCP36629",
    cfd: "16X31336",
    rncp_anterieur_2019: true,
    ...data,
  };
}

export function generateCertifIntituleNiveauFixture(
  data?: ICertifIntituleFixtureNiveauInput
): ICertification["intitule"]["niveau"] {
  return {
    cfd: {
      sigle: "TH1-X",
      europeen: "7",
      formation_diplome: "16X",
      libelle: "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE",
      interministeriel: "16X",
    },
    rncp: {
      europeen: "7",
    },
    ...data,
  };
}

export function generateCertifIntituleFixture(data?: ICertifIntituleFixtureInput): ICertification["intitule"] {
  return {
    cfd: {
      long: "EXPERT EN GESTION DE PATRIMOINE (IPAC)",
      court: "EXPERT EN GESTION DE PATRIMOINE",
    },
    rncp: "Expert en gestion de patrimoine",
    ...data,
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
    ouverture: new Date("2021-08-31T22:00:00.000Z"),
    fermeture: new Date("2024-08-31T21:59:59.000Z"),
    premiere_session: 2022,
    derniere_session: 2024,
    ...data,
  };
}

function generateCertificationPeriodeValiditeRncpFixture(
  data?: ICertifPeriodeValiditeRncpFixtureInput
): ICertification["periode_validite"]["rncp"] {
  if (data === null) {
    return null;
  }

  return {
    actif: true,
    activation: new Date("2022-07-05T00:00:00.000Z"),
    fin_enregistrement: new Date("2024-06-30T21:59:59.000Z"),
    debut_parcours: new Date("2022-06-30T22:00:00.000Z"),
    ...data,
  };
}

export function generateCertificationPeriodeValiditeFixture(
  data?: ICertifPeriodeValiditeFixtureInput
): ICertification["periode_validite"] {
  return {
    debut: new Date("2021-08-31T22:00:00.000Z"),
    fin: new Date("2024-08-31T21:59:59.000Z"),
    ...data,
    cfd: generateCertificationPeriodeValiditeCfdFixture(data?.cfd),
    rncp: generateCertificationPeriodeValiditeRncpFixture(data?.rncp),
  };
}

export function generateCertifTypeFixture(data?: ICertifTypeFixtureInput): ICertification["type"] {
  return {
    certificateurs_rncp: [{ siret: "11000007200014", nom: "MINISTERE DU TRAVAIL DU PLEIN EMPLOI ET DE L' INSERTION" }],
    enregistrement_rncp: "Enregistrement sur demande",
    gestionnaire_diplome: "DEPPA1",
    voie_acces: {
      rncp: {
        apprentissage: true,
        experience: true,
        candidature_individuelle: true,
        contrat_professionnalisation: true,
        formation_continue: true,
        formation_statut_eleve: true,
      },
    },
    nature: {
      cfd: {
        code: "2",
        libelle: "TITRE PROFESSIONNEL HOMOLOGUE OU CERTIFIE",
      },
    },
    ...data,
  };
}

export function generateCertifContinuiteFixture(
  self: Pick<ICertification, "identifiant" | "periode_validite">,
  data?: ICertifContinuiteFixtureInput
): ICertification["continuite"] {
  return {
    cfd:
      self.identifiant.cfd === null
        ? null
        : [
            {
              code: self.identifiant.cfd,
              ouverture: self.periode_validite.cfd?.ouverture ?? null,
              fermeture: self.periode_validite.cfd?.fermeture ?? null,
              courant: true,
            },
          ],
    rncp:
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
          ],
    ...data,
  };
}

export function generateCertificationFixture(data?: ICertificationFixtureInput): ICertification {
  const identifiant = generateCertifIdentifiantFixture(data?.identifiant);
  const periode_validite = generateCertificationPeriodeValiditeFixture(data?.periode_validite);

  return {
    base_legale: generateCertifBaseLegaleFixture(data?.base_legale),
    blocs_competences: generateCertifBlocsCompetencesFixture(data?.blocs_competences),
    convention_collectives: generateCertifConventionCollectivesFixture(data?.convention_collectives),
    domaines: generateCertifDomainesFixture(data?.domaines),
    identifiant,
    intitule: generateCertifIntituleFixture(data?.intitule),
    periode_validite,
    type: generateCertifTypeFixture(data?.type),
    continuite: generateCertifContinuiteFixture({ identifiant, periode_validite }, data?.continuite),
  };
}
