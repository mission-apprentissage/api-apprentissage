import { ObjectId } from "mongodb";
import {
  academieFixtures,
  inseeAnciennesFixtures,
  inseeArrondissementFixtures,
  inseeCollectiviteFixtures,
  sourceCodeInseeToMissionLocaleFixture,
  sourceCommuneFixtures,
  sourceDepartementFixtures,
  sourceRegionExtendedFixtures,
  sourceRegionsFixtures,
} from "shared/models/fixtures/commune.model.fixture";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { runCommuneImporter } from "./commune.importer.js";
import { useMongo } from "@tests/mongo.test.utils.js";

import { fetchAcademies } from "@/services/apis/enseignementSup/enseignementSup.js";
import { fetchGeoCommunes, fetchGeoDepartements, fetchGeoRegion, fetchGeoRegions } from "@/services/apis/geo/geo.js";
import {
  fetchAnciennesCommuneByCodeCommune,
  fetchArrondissementIndexedByCodeCommune,
  fetchCollectivitesOutreMer,
} from "@/services/apis/insee/insee.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

useMongo();

vi.mock("@/services/apis/geo/geo.js");
vi.mock("@/services/apis/enseignementSup/enseignementSup.js");
vi.mock("@/services/apis/insee/insee.js");

describe("runCommuneImporter", () => {
  const now = new Date("2024-10-03T21:53:08.141Z");
  const yesterday = new Date("2024-10-02T21:53:08.141Z");

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const import_id = new ObjectId();
    await getDbCollection("source.insee_to_ml").insertMany(
      sourceCodeInseeToMissionLocaleFixture.map((d) => ({
        ...d,
        _id: new ObjectId(),
        import_id,
      }))
    );

    return () => vi.useRealTimers();
  });

  it("should import initial communes", async () => {
    vi.mocked(fetchGeoRegions).mockResolvedValue(sourceRegionsFixtures);
    vi.mocked(fetchGeoRegion).mockImplementation(
      async (code: string) => sourceRegionExtendedFixtures.find((r) => r.code === code)!
    );
    vi.mocked(fetchGeoDepartements).mockImplementation(
      async (codeRegion: string) => sourceDepartementFixtures[codeRegion as keyof typeof sourceDepartementFixtures]
    );
    vi.mocked(fetchGeoCommunes).mockImplementation(
      async (codeDepartement: string) => sourceCommuneFixtures[codeDepartement as keyof typeof sourceCommuneFixtures]
    );
    vi.mocked(fetchCollectivitesOutreMer).mockResolvedValue(inseeCollectiviteFixtures);
    vi.mocked(fetchAcademies).mockResolvedValue(academieFixtures);
    vi.mocked(fetchArrondissementIndexedByCodeCommune).mockResolvedValue(inseeArrondissementFixtures);
    vi.mocked(fetchAnciennesCommuneByCodeCommune).mockResolvedValue(inseeAnciennesFixtures);

    await runCommuneImporter();

    expect(fetchGeoRegions).toHaveBeenCalledTimes(1);
    expect(fetchGeoRegion).toHaveBeenCalledTimes(2);
    expect(fetchGeoDepartements).toHaveBeenCalledTimes(4);
    expect(fetchGeoCommunes).toHaveBeenCalledTimes(7);

    const communes = await getDbCollection("commune").find({}).toArray();

    expect(
      communes.map(({ _id, ...rest }) => rest).toSorted((a, b) => a.code.insee.localeCompare(b.code.insee))
    ).toMatchSnapshot();

    const importMetas = await getDbCollection("import.meta").find().toArray();

    expect(importMetas).toEqual([
      {
        _id: expect.any(ObjectId),
        import_date: now,
        type: "communes",
        status: "done",
      },
    ]);
  });

  it("should import communes with existing regions and departements", async () => {
    await getDbCollection("commune").insertMany(
      sourceCommuneFixtures["75"].map((geoCommune) => ({
        _id: new ObjectId(),
        nom: "Ancien nom",
        code: { insee: geoCommune.code, postaux: geoCommune.codesPostaux },
        departement: {
          nom: "Ancien nom departement",
          codeInsee: "Ancien code departement",
        },
        region: {
          codeInsee: "Ancien code region",
          nom: "Ancien nom region",
        },
        academie: {
          code: "Ancien code",
          nom: "Ancien nom",
          id: "Ancien id",
        },
        localisation: {
          centre: { type: "Point", coordinates: [0, 0] },
          bbox: {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [0, 0],
                [0, 0],
                [0, 0],
              ],
            ],
          },
        },
        mission_locale: null,
        arrondissements: [],
        anciennes: [],
        updated_at: yesterday,
        created_at: yesterday,
      }))
    );
    await getDbCollection("commune").insertOne({
      _id: new ObjectId(),
      nom: "Ancien nom",
      code: { insee: "Code supprimé", postaux: [] },
      departement: {
        nom: "Ancien nom departement",
        codeInsee: "Ancien code departement",
      },
      region: {
        codeInsee: "Ancien code region",
        nom: "Ancien nom region",
      },
      academie: {
        code: "Ancien code",
        nom: "Ancien nom",
        id: "Ancien id",
      },
      localisation: {
        centre: { type: "Point", coordinates: [0, 0] },
        bbox: {
          type: "Polygon",
          coordinates: [
            [
              [0, 0],
              [0, 0],
              [0, 0],
              [0, 0],
            ],
          ],
        },
      },
      mission_locale: null,
      arrondissements: [],
      anciennes: [],
      updated_at: yesterday,
      created_at: yesterday,
    });
    await getDbCollection("import.meta").insertOne({
      _id: new ObjectId(),
      import_date: yesterday,
      type: "communes",
      status: "done",
    });

    vi.mocked(fetchGeoRegions).mockResolvedValue(sourceRegionsFixtures);
    vi.mocked(fetchGeoRegion).mockImplementation(
      async (code: string) => sourceRegionExtendedFixtures.find((r) => r.code === code)!
    );
    vi.mocked(fetchGeoDepartements).mockImplementation(
      async (codeRegion: string) => sourceDepartementFixtures[codeRegion as keyof typeof sourceDepartementFixtures]
    );
    vi.mocked(fetchGeoCommunes).mockImplementation(
      async (codeDepartement: string) => sourceCommuneFixtures[codeDepartement as keyof typeof sourceCommuneFixtures]
    );

    vi.mocked(fetchCollectivitesOutreMer).mockResolvedValue(inseeCollectiviteFixtures);
    vi.mocked(fetchAcademies).mockResolvedValue(academieFixtures);
    vi.mocked(fetchArrondissementIndexedByCodeCommune).mockResolvedValue(inseeArrondissementFixtures);
    vi.mocked(fetchAnciennesCommuneByCodeCommune).mockResolvedValue(inseeAnciennesFixtures);

    await runCommuneImporter();

    expect(fetchGeoRegions).toHaveBeenCalledTimes(1);
    expect(fetchGeoRegion).toHaveBeenCalledTimes(2);
    expect(fetchGeoDepartements).toHaveBeenCalledTimes(4);
    expect(fetchGeoCommunes).toHaveBeenCalledTimes(7);

    const communes = await getDbCollection("commune").find({}).toArray();

    expect(
      communes.map(({ _id, ...rest }) => rest).toSorted((a, b) => a.code.insee.localeCompare(b.code.insee))
    ).toMatchSnapshot();

    const importMetas = await getDbCollection("import.meta").find().toArray();

    expect(importMetas).toEqual([
      {
        _id: expect.any(ObjectId),
        import_date: yesterday,
        type: "communes",
        status: "done",
      },
      {
        _id: expect.any(ObjectId),
        import_date: now,
        type: "communes",
        status: "done",
      },
    ]);
  });
});
