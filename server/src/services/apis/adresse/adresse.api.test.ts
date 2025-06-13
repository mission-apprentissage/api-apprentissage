import type { IGeoJsonPoint } from "api-alternance-sdk";
import { ObjectId } from "mongodb";
import nock from "nock";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { searchAdresseGeopoint } from "./adresse.api.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { useMongo } from "@tests/mongo.test.utils.js";

const now = new Date("2024-12-04T00:00:00Z");
const inOneYear = new Date("2025-12-04T00:00:00Z");

useMongo();

beforeEach(() => {
  nock.disableNetConnect();

  vi.useFakeTimers({ now });

  return () => {
    vi.resetAllMocks();
    vi.useRealTimers();

    nock.cleanAll();
    nock.enableNetConnect();
  };
});

describe("searchAdresseFeature", () => {
  const query = {
    codePostal: "59290",
    codeInsee: "59646",
    adresse: "5 Allee louis cloart",
  };
  const expectedGeopoint: IGeoJsonPoint = { type: "Point", coordinates: [3.131052, 50.685596] };

  it("should return the feature and persist into cache", async () => {
    const response = {
      type: "FeatureCollection",
      version: "draft",
      features: [
        {
          type: "Feature",
          geometry: { type: "Point", coordinates: [3.131052, 50.685596] },
          properties: {
            label: "5 Rue Louis Cloart 59290 Wasquehal",
            score: 0.5725293388429752,
            housenumber: "5",
            id: "59646_rchddq_00005",
            banId: "1cd431fd-261a-4386-a778-693cf604bda3",
            name: "5 Rue Louis Cloart",
            postcode: "59290",
            citycode: "59646",
            x: 709277.9,
            y: 7065427.23,
            city: "Wasquehal",
            context: "59, Nord, Hauts-de-France",
            type: "housenumber",
            importance: 0.57055,
            street: "Rue Louis Cloart",
          },
        },
      ],
      attribution: "BAN",
      licence: "ETALAB-2.0",
      query: "5 Allee louis cloart",
      filters: { citycode: "59646", postcode: "59290" },
      limit: 5,
    };

    nock("https://api-adresse.data.gouv.fr")
      .get("/search")
      .query({ limit: 1, autocomplete: 0, postcode: "59290", citycode: "59646", q: "5+Allee+louis+cloart" })
      .reply(200, response);

    const result = await searchAdresseGeopoint(query);

    expect(result).toEqual(expectedGeopoint);
    const cachedAdresse = await getDbCollection("cache.adresse").findOne({});
    expect(cachedAdresse).toEqual({
      _id: expect.any(ObjectId),
      identifiant: query,
      ttl: inOneYear,
      data: expectedGeopoint,
    });
  });

  it("should use cache if exists", async () => {
    await getDbCollection("cache.adresse").insertOne({
      _id: new ObjectId(),
      identifiant: query,
      ttl: inOneYear,
      data: expectedGeopoint,
    });

    const result = await searchAdresseGeopoint(query);

    expect(result).toEqual(expectedGeopoint);

    expect(nock.isDone()).toBe(true);
  });
});
