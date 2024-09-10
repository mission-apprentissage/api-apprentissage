import type { IFormationCatalogue } from "shared/models/source/catalogue/source.catalogue.model";

export const catalogueDataFixture: IFormationCatalogue[] = [
  {
    _id: "1",
    cfd: "cfd1",
    cle_ministere_educatif: "cle_me_1",
    catalogue_published: true,
  },
  {
    _id: "2",
    cfd: "cfd2",
    cle_ministere_educatif: "cle_me_2",
    catalogue_published: true,
  },
  {
    _id: "3",
    cfd: "cfd3",
    cle_ministere_educatif: "cle_me_3",
    catalogue_published: true,
  },
  {
    _id: "4",
    cfd: "cfd4",
    cle_ministere_educatif: "cle_me_4",
    catalogue_published: true,
  },
];

export async function* generateCatalogueData() {
  for (const formation of catalogueDataFixture) {
    yield formation;
  }
}

export const exceptedUaiFormation: Record<string, string> = {
  cle_me_1: "XXXXX",
  cle_me_2: "YYYYY",
};
export const catalogueEducatifDataFixture: { cle_ministere_educatif: string; uai_formation: string }[] = [
  {
    cle_ministere_educatif: "cle_me_1",
    uai_formation: "XXXXX",
  },
  {
    cle_ministere_educatif: "cle_me_2",
    uai_formation: "YYYYY",
  },
];

export async function* generateCatalogueEducatifData() {
  for (const formation of catalogueEducatifDataFixture) {
    yield formation;
  }
}
