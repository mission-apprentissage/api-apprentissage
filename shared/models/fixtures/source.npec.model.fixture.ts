import { ObjectId } from "bson";

import { ISourceNpec } from "../source/npec/source.npec.model";
import { getFixtureValue } from "./fixture_helper";

type IGenerateNpecFixtureDataInput = Partial<ISourceNpec["data"]> & Pick<ISourceNpec["data"], "type">;

type IGenerateNpecFixtureInput = Partial<Omit<ISourceNpec, "data">> & { data: IGenerateNpecFixtureDataInput };

export function generateNpecFixtureData(data?: IGenerateNpecFixtureDataInput): ISourceNpec["data"] {
  if (!data || data.type === "npec") {
    return {
      type: "npec",
      rncp: getFixtureValue(data, "rncp", "RNCP12345"),
      formation_libelle: getFixtureValue(data, "formation_libelle", "Formation de test"),
      certificateur: getFixtureValue(data, "certificateur", "Certificateur de test"),
      diplome_code: getFixtureValue(data, "diplome_code", "01000000"),
      diplome_libelle: getFixtureValue(data, "diplome_libelle", "Diplôme de test"),
      cpne_code: getFixtureValue(data, "cpne_code", "12"),
      cpne_libelle: getFixtureValue(data, "cpne_libelle", "CPNE de test"),
      npec: getFixtureValue(data, "npec", 8000),
      statut: getFixtureValue(data, "statut", "D"),
      date_applicabilite: getFixtureValue(data, "date_applicabilite", new Date("2023-09-01T23:00:00.000Z")),
      procedure: getFixtureValue(data, "procedure", null),
      idcc: getFixtureValue(data, "idcc", null),
    };
  }

  return {
    type: "cpne-idcc",
    idcc: getFixtureValue(data, "idcc", "8323"),
    cpne_code: getFixtureValue(data, "cpne_code", "12"),
    cpne_libelle: getFixtureValue(data, "cpne_libelle", "CPNE de test"),
  };
}

export function generateNpecFixture(data?: IGenerateNpecFixtureInput): ISourceNpec {
  return {
    _id: getFixtureValue(data, "_id", new ObjectId()),
    filename: getFixtureValue(data, "filename", "Referentiel-des-NPEC_vMAJ-09.04.2024.xlsx"),
    date_file: getFixtureValue(data, "date_file", new Date("2024-04-02T22:00:00.000Z")),
    date_import: getFixtureValue(data, "date_import", new Date("2024-04-19T00:00:00Z")),
    data: generateNpecFixtureData(data?.data),
  };
}
