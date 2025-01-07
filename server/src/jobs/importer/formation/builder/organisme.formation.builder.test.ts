import { useMongo } from "@tests/mongo.test.utils.js";
import { generateOrganismeFixture } from "shared/models/fixtures/index";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  communesFixture,
  etablissementsFixture,
  expectedOrganismes,
  uniteLegaleFixture,
} from "@/jobs/importer/organisme/organisme.importer.fixtures.js";
import { getEtablissementDiffusible, getUniteLegaleDiffusible } from "@/services/apis/entreprise/entreprise.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { buildFormationOrganisme } from "./organisme.formation.builder.js";

useMongo();
vi.mock("@/services/apis/entreprise/entreprise.js", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actual: any = await importOriginal();
  return {
    ...actual,
    getEtablissementDiffusible: vi.fn(),
    getUniteLegaleDiffusible: vi.fn(),
  };
});

describe("buildFormationOrganisme", () => {
  const organismes = [
    generateOrganismeFixture({
      identifiant: { siret: "42180445100035", uai: "0771234A" },
    }),
    generateOrganismeFixture({
      identifiant: { siret: "19350030300014", uai: "0352660B" },
    }),
  ];

  beforeEach(async () => {
    await getDbCollection("organisme").insertMany(organismes);

    vi.mocked(getEtablissementDiffusible).mockImplementation(async (siret: string) => {
      return etablissementsFixture.find((e) => e.siret === siret) ?? null;
    });
    vi.mocked(getUniteLegaleDiffusible).mockImplementation(async (siren: string) => {
      return uniteLegaleFixture.find((e) => e.siren === siren) ?? null;
    });

    await getDbCollection("commune").insertMany(communesFixture);
  });

  it("should return the organisme if it exists", async () => {
    const organisme = await buildFormationOrganisme({
      siret: "42180445100035",
      uai: "0771234A",
    });

    expect(organisme).toEqual({
      organisme: organismes[0],
      connu: true,
    });
  });

  it("should normalize the uai to uppercase", async () => {
    const organisme = await buildFormationOrganisme({
      siret: "42180445100035",
      uai: "0771234a",
    });

    expect(organisme).toEqual({
      organisme: organismes[0],
      connu: true,
    });
  });

  it("should return the organisme by siret couple uai/siret is not found", async () => {
    const organisme = await buildFormationOrganisme({
      siret: "42180445100035",
      uai: "0771234B",
    });

    expect(organisme).toEqual({
      organisme: organismes[0],
      connu: true,
    });
  });

  it("should return null if the siret is invalid", async () => {
    const organisme = await buildFormationOrganisme({
      siret: "invalid",
      uai: "0771234A",
    });

    expect(organisme).toEqual({
      organisme: null,
      connu: false,
    });
  });

  it("should build the organisme if it does not exist", async () => {
    const organisme = await buildFormationOrganisme({
      siret: expectedOrganismes[0].identifiant.siret,
      uai: expectedOrganismes[0].identifiant.uai,
    });

    expect(organisme).toEqual({
      organisme: {
        ...expectedOrganismes[0],
        renseignements_specifiques: {
          numero_activite: null,
          qualiopi: false,
        },
        statut: {
          referentiel: "supprimé",
        },
      },
      connu: false,
    });
  });
});
