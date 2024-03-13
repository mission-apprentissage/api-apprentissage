import { ObjectId } from "bson";

import { ISourceKitApprentissage } from "../source/kitApprentissage/source.kit_apprentissage.model";
import { getFixtureValue } from "./fixture_helper";

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
  };
}

export function generateKitApprentissageFixture(data?: Partial<ISourceKitApprentissage>): ISourceKitApprentissage {
  return {
    source: getFixtureValue(data, "source", "kit_apprentissage_20240119.csv"),
    date: getFixtureValue(data, "date", new Date("2024-01-19T00:00:00Z")),
    _id: getFixtureValue(data, "_id", new ObjectId()),
    data: getFixtureValue(data, "data", generateKitApprentissageFixtureData()),
  };
}
