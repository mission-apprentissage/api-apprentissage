import { ObjectId } from "bson";

import { IBcn_N_FormationDiplome } from "../source/bcn/bcn.n_formation_diplome.model";
import { IBcn_N51_FormationDiplome } from "../source/bcn/bcn.n51_formation_diplome.model";
import { IBcn_V_FormationDiplome } from "../source/bcn/bcn.v_formation_diplome.model";
import { getFixtureValue } from "./fixture_helper";

export function generateSourceBcn_V_FormationDiplomeDataFixture(
  data?: Partial<IBcn_V_FormationDiplome["data"]>
): IBcn_V_FormationDiplome["data"] {
  return {
    FORMATION_DIPLOME: getFixtureValue(data, "FORMATION_DIPLOME", "36T23301"),
    NIVEAU_FORMATION_DIPLOME: getFixtureValue(data, "NIVEAU_FORMATION_DIPLOME", "36T"),
    N_NIVEAU_FORMATION_DIPLOME_LIBELLE_100: getFixtureValue(
      data,
      "N_NIVEAU_FORMATION_DIPLOME_LIBELLE_100",
      "TH DE NIV 3 MINISTERE DU TRAVAIL - AFPA"
    ),
    GROUPE_SPECIALITE: getFixtureValue(data, "GROUPE_SPECIALITE", "233"),
    N_GROUPE_SPECIALITE_LIBELLE_LONG: getFixtureValue(data, "N_GROUPE_SPECIALITE_LIBELLE_LONG", "BATIMENT : FINITIONS"),
    LETTRE_SPECIALITE: getFixtureValue(data, "LETTRE_SPECIALITE", "M"),
    N_LETTRE_SPECIALITE_LIBELLE_LONG: getFixtureValue(
      data,
      "N_LETTRE_SPECIALITE_LIBELLE_LONG",
      "AUTRE/NON INDIQUE (DOMAINE TECHNICO-PRO)"
    ),
    ANCIEN_RECME: getFixtureValue(data, "ANCIEN_RECME", null),
    LIBELLE_COURT: getFixtureValue(data, "LIBELLE_COURT", "TH3-T"),
    LIBELLE_STAT_33: getFixtureValue(data, "LIBELLE_STAT_33", "COND TRAVAUX AMENAGEMENT FINITION"),
    LIBELLE_LONG_200: getFixtureValue(data, "LIBELLE_LONG_200", "CONDUCTEUR DE TRAVAUX AMENAGEMENT FINITIONS (TP)"),
    DATE_OUVERTURE: getFixtureValue(data, "DATE_OUVERTURE", "01/09/2019"),
    DATE_FERMETURE: getFixtureValue(data, "DATE_FERMETURE", "31/08/2024"),
    UNITE_CAPITALISABLE: getFixtureValue(data, "UNITE_CAPITALISABLE", null),
    DATE_PREMIERE_SESSION: getFixtureValue(data, "DATE_PREMIERE_SESSION", null),
    DATE_DERNIERE_SESSION: getFixtureValue(data, "DATE_DERNIERE_SESSION", null),
    DATE_ARRETE_CREATION: getFixtureValue(data, "DATE_ARRETE_CREATION", null),
    DATE_ARRETE_ABROGATION: getFixtureValue(data, "DATE_ARRETE_ABROGATION", "07/05/2024"),
    DATE_ARRETE_MODIFICATION_1: getFixtureValue(data, "DATE_ARRETE_MODIFICATION_1", null),
    DATE_ARRETE_MODIFICATION_2: getFixtureValue(data, "DATE_ARRETE_MODIFICATION_2", null),
    DATE_ARRETE_MODIFICATION_3: getFixtureValue(data, "DATE_ARRETE_MODIFICATION_3", null),
    DATE_ARRETE_MODIFICATION_4: getFixtureValue(data, "DATE_ARRETE_MODIFICATION_4", null),
    DATE_ARRETE_MODIFICATION_5: getFixtureValue(data, "DATE_ARRETE_MODIFICATION_5", null),
    DATE_ARRETE_MODIFICATION_6: getFixtureValue(data, "DATE_ARRETE_MODIFICATION_6", null),
    DATE_ARRETE_MODIFICATION_7: getFixtureValue(data, "DATE_ARRETE_MODIFICATION_7", null),
    DATE_ARRETE_MODIFICATION_8: getFixtureValue(data, "DATE_ARRETE_MODIFICATION_8", null),
    DATE_ARRETE_MODIFICATION_9: getFixtureValue(data, "DATE_ARRETE_MODIFICATION_9", null),
    DATE_ARRETE_MODIFICATION_10: getFixtureValue(data, "DATE_ARRETE_MODIFICATION_10", null),
    COMMENTAIRE: getFixtureValue(data, "COMMENTAIRE", "rncp 1796"),
    NATURE_FORMATION_DIPLOME: getFixtureValue(data, "NATURE_FORMATION_DIPLOME", "1"),
    N_NATURE_FORMATION_DIPLOME_LIBELLE_100: getFixtureValue(
      data,
      "N_NATURE_FORMATION_DIPLOME_LIBELLE_100",
      "DIPLOME NATIONAL / DIPLOME D'ETAT"
    ),
    GESTIONNAIRE_FORMATION_DIPLOME: getFixtureValue(data, "GESTIONNAIRE_FORMATION_DIPLOME", "DEPPA1"),
    DATE_INTERVENTION: getFixtureValue(data, "DATE_INTERVENTION", "19/01/2021"),
    ID_DOCUMENT: getFixtureValue(data, "ID_DOCUMENT", null),
    CITE_DOMAINE_FORMATION: getFixtureValue(data, "CITE_DOMAINE_FORMATION", "582"),
    N_CITE_DOMAINE_FORMATION_LIBELLE_EDITION: getFixtureValue(
      data,
      "N_CITE_DOMAINE_FORMATION_LIBELLE_EDITION",
      "Bâtiment et génie civil"
    ),
    NIVEAU_QUALIFICATION_RNCP: getFixtureValue(data, "NIVEAU_QUALIFICATION_RNCP", "05"),
    N_NIVEAU_QUALIFICATION_RNCP_LIBELLE_LONG: getFixtureValue(
      data,
      "N_NIVEAU_QUALIFICATION_RNCP_LIBELLE_LONG",
      "NIVEAU 5"
    ),
  };
}

export function generateSourceBcn_V_FormationDiplomeFixture(
  data?: Partial<IBcn_V_FormationDiplome>
): IBcn_V_FormationDiplome {
  return {
    _id: getFixtureValue(data, "_id", new ObjectId()),
    source: "V_FORMATION_DIPLOME",
    date: getFixtureValue(data, "date", new Date("2024-03-07T00:00:00Z")),
    data: getFixtureValue(data, "data", generateSourceBcn_V_FormationDiplomeDataFixture()),
  };
}

export function generateSourceBcn_N_FormationDiplomeDataFixture(
  data?: Partial<IBcn_N_FormationDiplome["data"]>
): IBcn_N_FormationDiplome["data"] {
  return {
    ...generateSourceBcn_V_FormationDiplomeDataFixture(data),
    ANCIEN_DIPLOME_1: null,
    ANCIEN_DIPLOME_2: null,
    ANCIEN_DIPLOME_3: null,
    ANCIEN_DIPLOME_4: null,
    ANCIEN_DIPLOME_5: null,
    ANCIEN_DIPLOME_6: null,
    ANCIEN_DIPLOME_7: null,
    NOUVEAU_DIPLOME_1: null,
    NOUVEAU_DIPLOME_2: null,
    NOUVEAU_DIPLOME_3: null,
    NOUVEAU_DIPLOME_4: null,
    NOUVEAU_DIPLOME_5: null,
    NOUVEAU_DIPLOME_6: null,
    NOUVEAU_DIPLOME_7: null,
    NB_MEF_OUVERT: null,
    NB_MEF_FERME: null,
    DATE_SESSION_RATTRAPAGE: null,
    OBSERVATION: null,
    N_COMMENTAIRE: null,
    CITE_DOMAINE_DETAILLE: null,
    N_CITE_2013_DOMAINE_DETAILL_LIBELLE_EDITION: null,
  };
}

export function generateSourceBcn_N_FormationDiplomeFixture(
  data?: Partial<IBcn_N_FormationDiplome>
): IBcn_N_FormationDiplome {
  return {
    _id: getFixtureValue(data, "_id", new ObjectId()),
    source: "N_FORMATION_DIPLOME",
    date: getFixtureValue(data, "date", new Date("2024-03-07T00:00:00Z")),
    data: getFixtureValue(data, "data", generateSourceBcn_N_FormationDiplomeDataFixture()),
  };
}

export function generateSourceBcn_N51_FormationDiplomeDataFixture(
  data?: Partial<IBcn_N51_FormationDiplome["data"]>
): IBcn_N51_FormationDiplome["data"] {
  return {
    ...generateSourceBcn_V_FormationDiplomeDataFixture(data),
    N_COMMENTAIRE: null,
    CITE_DOMAINE_DETAILLE: null,
    N_CITE_2013_DOMAINE_DETAILL_LIBELLE_EDITION: null,
    DIPLOME_SISE: null,
    N_DIPLOME_SISE_LIBELLE_INTITULE_1: null,
    HABILITATION_ORIGINE: null,
    NUMERO_UAI: null,
  };
}

export function generateSourceBcn_N51_FormationDiplomeFixture(
  data?: Partial<IBcn_N51_FormationDiplome>
): IBcn_N51_FormationDiplome {
  return {
    _id: getFixtureValue(data, "_id", new ObjectId()),
    source: "N_FORMATION_DIPLOME_ENQUETE_51",
    date: getFixtureValue(data, "date", new Date("2024-03-07T00:00:00Z")),
    data: getFixtureValue(data, "data", generateSourceBcn_N51_FormationDiplomeDataFixture()),
  };
}
