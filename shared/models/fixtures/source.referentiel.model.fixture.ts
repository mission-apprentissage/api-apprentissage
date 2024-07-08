import { IOrganismeReferentiel } from "../source/referentiel/source.referentiel.model";
import { getFixtureValue } from "./fixture_helper";

export type IOrganismeReferentielDataInput = Partial<IOrganismeReferentiel>;

export function generateOrganismeReferentielFixture(data: IOrganismeReferentielDataInput): IOrganismeReferentiel {
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
