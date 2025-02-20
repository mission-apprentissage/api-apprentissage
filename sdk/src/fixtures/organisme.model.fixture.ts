import type { IOrganisme } from "../models/index.js";

export type IOrganismeInput<T extends IOrganisme> = Partial<
  Omit<T, "identifiant"> & {
    identifiant: Partial<IOrganisme["identifiant"]>;
  }
>;

export function generateOrganismeFixture(data?: IOrganismeInput<IOrganisme>): IOrganisme {
  const { identifiant, ...rest } = data ?? {};

  return {
    identifiant: {
      uai: "0352660B",
      siret: "19350030300014",
      ...identifiant,
    },
    contacts: [],
    etablissement: {
      siret: "19350030300014",
      ouvert: true,
      enseigne: null,
      adresse: {
        label: "34 RUE BAHON-RAULT",
        code_postal: "35000",
        commune: {
          nom: "Rennes",
          code_insee: "35238",
        },
        departement: {
          nom: "Ille-et-Vilaine",
          code_insee: "35",
        },
        region: {
          code_insee: "53",
          nom: "Bretagne",
        },
        academie: {
          id: "A14",
          code: "14",
          nom: "Rennes",
        },
      },
      geopoint: {
        type: "Point",
        coordinates: [-1.6864, 48.1337],
      },
      creation: new Date("1970-01-05T19:22:01.200Z"),
      fermeture: null,
    },
    renseignements_specifiques: {
      qualiopi: true,
      numero_activite: "5335P000935",
    },
    statut: {
      referentiel: "présent",
    },
    unite_legale: {
      siren: "193500303",
      actif: true,
      raison_sociale: "LYCEE DES METIERS PIERRE MENDES FRANCE",
      creation: new Date("1969-12-30T07:03:18.000+00:00"),
      cessation: null,
    },
    ...rest,
  };
}
