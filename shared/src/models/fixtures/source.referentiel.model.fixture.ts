import { ObjectId } from "bson";

import { IOrganismeReferentiel, ISourceReferentiel } from '../source/referentiel/source.referentiel.model.js';
import { getFixtureValue } from './fixture_helper.js';

export type IOrganismeReferentielDataInput = Partial<IOrganismeReferentiel>;

export type ISourceReferentielInput = Partial<
  Omit<ISourceReferentiel, "data"> & {
    data: IOrganismeReferentielDataInput;
  }
>;

export function generateOrganismeReferentielFixture(data?: IOrganismeReferentielDataInput): IOrganismeReferentiel {
  return {
    siret: getFixtureValue(data, "siret", "11000007200014"),
    certifications: getFixtureValue(data, "certifications", []),
    contacts: getFixtureValue(data, "contacts", []),
    diplomes: getFixtureValue(data, "diplomes", []),
    lieux_de_formation: getFixtureValue(data, "lieux_de_formation", []),
    nature: getFixtureValue(data, "nature", "responsable_formateur"),
    referentiels: getFixtureValue(data, "referentiels", []),
    reseaux: getFixtureValue(data, "reseaux", []),
    uai_potentiels: getFixtureValue(data, "uai_potentiels", []),
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
