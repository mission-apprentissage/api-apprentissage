import type { IFormation, IOrganisme } from "../models/index.js";
import type { ICertificationFixtureInput } from "./certification.model.fixture.js";
import { generateCertificationFixture } from "./certification.model.fixture.js";
import type { IOrganismeInput } from "./organisme.model.fixture.js";
import { generateOrganismeFixture } from "./organisme.model.fixture.js";

export type IFormationFixtureInput<T extends IFormation = IFormation> = Partial<
  Omit<T, "formateur" | "responsable" | "certification" | "lieu"> & {
    formateur: { connu: boolean; organisme: IOrganismeInput<IOrganisme> };
    responsable: { connu: boolean; organisme: IOrganismeInput<IOrganisme> };
    certification: { connue: boolean; valeur: ICertificationFixtureInput };
    lieu: Partial<T["lieu"]>;
  }
>;

export function generateFormationFixture<T extends IFormation>(data?: IFormationFixtureInput<T>): IFormation {
  return {
    identifiant: {
      cle_ministere_educatif: "123456789",
    },
    statut: {
      catalogue: "publié",
    },
    contact: {
      email: "mail@mail.fr",
      telephone: "0123456789",
    },
    onisep: {
      url: null,
      intitule: null,
      libelle_poursuite: null,
      lien_site_onisepfr: null,
      discipline: null,
      domaine_sousdomaine: null,
    },
    modalite: {
      entierement_a_distance: false,
      duree_indicative: 1,
      annee_cycle: 1,
      mef_10: null,
    },
    contenu_educatif: {
      contenu: "Contenu éducatif",
      objectif: "Apprendre",
    },
    sessions: [
      { debut: new Date("2023-09-01T00:00:00.000Z"), fin: new Date("2024-08-31T00:00:00.000Z"), capacite: 10 },
      { debut: new Date("2024-09-01T00:00:00.000Z"), fin: new Date("2025-08-31T00:00:00.000Z"), capacite: 10 },
      { debut: new Date("2025-09-01T00:00:00.000Z"), fin: new Date("2026-08-31T00:00:00.000Z"), capacite: 10 },
    ],
    ...data,
    formateur: {
      organisme: generateOrganismeFixture(data?.formateur?.organisme),
      connu: data?.formateur?.connu ?? true,
    },
    responsable: {
      organisme: generateOrganismeFixture(data?.responsable?.organisme),
      connu: data?.responsable?.connu ?? true,
    },
    certification: {
      valeur: generateCertificationFixture(data?.certification?.valeur),
      connue: data?.certification?.connue ?? true,
    },
    lieu: {
      adresse: {
        label: "1T impasse Passoir",
        code_postal: "92110",
        commune: {
          nom: "Clichy",
          code_insee: "92024",
        },
        departement: {
          nom: "auts-de-Seine",
          code_insee: "92",
        },
        region: {
          code_insee: "11",
          nom: "Île-de-France",
        },
        academie: {
          id: "A25",
          code: "25",
          nom: "Versailles",
        },
      },
      geolocalisation: {
        type: "Point",
        coordinates: [2.3041, 48.9041],
      },
      precision: 15,
      siret: null,
      uai: null,
      ...data?.lieu,
    },
  };
}

export function generateFormationFixtureWithoutContact<T extends IFormation>(
  data?: Omit<IFormationFixtureInput<T>, "contact">
): IFormation {
  return generateFormationFixture({
    ...data,
    contact: undefined,
  });
}
