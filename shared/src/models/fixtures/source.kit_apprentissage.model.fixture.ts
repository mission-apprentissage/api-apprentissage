import { ObjectId } from "bson";

import { ISourceKitApprentissage } from "../source/kitApprentissage/source.kit_apprentissage.model.js";
import { getFixtureValue } from "./fixture_helper.js";

export function generateKitApprentissageFixtureData(
  data?: Partial<ISourceKitApprentissage["data"]>
): ISourceKitApprentissage["data"] {
  return {
    "Code Diplôme": getFixtureValue(data, "Code Diplôme", "code"),
    "Intitulé diplôme (DEPP)": getFixtureValue(data, "Intitulé diplôme (DEPP)", "intitule"),
    FicheRNCP: getFixtureValue(data, "FicheRNCP", "fiche"),
    "Niveau fiche RNCP": getFixtureValue(data, "Niveau fiche RNCP", "niveau"),
    "Abrégé de diplôme (RNCP)": getFixtureValue(data, "Abrégé de diplôme (RNCP)", "abrege"),
    "Dernière MaJ": getFixtureValue(data, "Dernière MaJ", "maj"),
    "Accès à l'apprentissage de la fiche RNCP (oui/non)": getFixtureValue(
      data,
      "Accès à l'apprentissage de la fiche RNCP (oui/non)",
      "acces"
    ),
    "Date d'échéance de la fiche RNCP": getFixtureValue(data, "Date d'échéance de la fiche RNCP", "date"),
    "Fiche ACTIVE/INACTIVE": getFixtureValue(data, "Fiche ACTIVE/INACTIVE", "active"),
    "Intitulé certification (RNCP)": getFixtureValue(data, "Intitulé certification (RNCP)", "intitule_certification"),
    "Type d'enregistrement": getFixtureValue(data, "Type d'enregistrement", "type_enregistrement"),
    "Date de publication de la fiche": getFixtureValue(data, "Date de publication de la fiche", "date_publication"),
    "Date de décision": getFixtureValue(data, "Date de décision", "date_decision"),
    "Date de début des parcours certifiants": getFixtureValue(
      data,
      "Date de début des parcours certifiants",
      "date_debut"
    ),
    "Date limite de la délivrance": getFixtureValue(data, "Date limite de la délivrance", "date_limite"),
    "Nouvelle Certification rempla (RNCP)": getFixtureValue(
      data,
      "Nouvelle Certification rempla (RNCP)",
      "nouvelle_certification"
    ),
    "Ancienne Certification (RNCP)": getFixtureValue(data, "Ancienne Certification (RNCP)", "ancienne_certification"),
  };
}

export function generateKitApprentissageFixture(data?: Partial<ISourceKitApprentissage>): ISourceKitApprentissage {
  return {
    source: getFixtureValue(data, "source", "Kit_apprentissage_20240119.csv"),
    date: getFixtureValue(data, "date", new Date("2024-01-19T00:00:00Z")),
    _id: getFixtureValue(data, "_id", new ObjectId()),
    data: getFixtureValue(data, "data", generateKitApprentissageFixtureData()),
    version: getFixtureValue(data, "version", "20240119"),
  };
}
