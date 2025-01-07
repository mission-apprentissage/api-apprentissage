import { ObjectId } from "bson";

import type { IOrganismeReferentiel, ISourceReferentiel } from "../source/referentiel/source.referentiel.model.js";
import { getFixtureValue } from "./fixture_helper.js";

export type IOrganismeReferentielDataInput = Partial<IOrganismeReferentiel>;

export type ISourceReferentielInput = Partial<
  Omit<ISourceReferentiel, "data"> & {
    data: IOrganismeReferentielDataInput;
  }
>;

export function generateOrganismeReferentielFixture(data?: IOrganismeReferentielDataInput): IOrganismeReferentiel {
  return {
    siret: "11000007200014",
    certifications: [],
    contacts: [],
    diplomes: [],
    lieux_de_formation: [],
    nature: "responsable_formateur",
    referentiels: [],
    reseaux: [],
    uai_potentiels: [],
    ...data,
  };
}

export function generateSourceReferentiel(data?: ISourceReferentielInput): ISourceReferentiel {
  return {
    _id: getFixtureValue(data, "_id", new ObjectId()),
    date: getFixtureValue(data, "date", new Date("2024-04-19T00:00:00Z")),
    data: generateOrganismeReferentielFixture(data?.data),
  };
}
