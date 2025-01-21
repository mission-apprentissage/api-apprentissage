import { useMongo } from "@tests/mongo.test.utils.js";
import { ObjectId } from "mongodb";
import type { ICommuneInternal } from "shared/models/commune.model";
import { beforeEach, describe, expect, it } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { buildFormationLieu } from "./lieu.formation.builder.js";

useMongo();

describe("buildFormationLieu", () => {
  const communes: ICommuneInternal[] = [
    {
      _id: new ObjectId(),
      code: {
        insee: "77010",
        postaux: ["77720"],
      },
      academie: {
        nom: "Créteil",
        id: "A24",
        code: "24",
      },
      created_at: new Date("2024-11-28T15:47:27.885Z"),
      departement: {
        nom: "Seine-et-Marne",
        codeInsee: "77",
      },
      localisation: {
        centre: {
          coordinates: [2.8951, 48.619],
          type: "Point",
        },
        bbox: {
          coordinates: [
            [
              [2.837932, 48.58302],
              [2.952297, 48.58302],
              [2.952297, 48.655032],
              [2.837932, 48.655032],
              [2.837932, 48.58302],
            ],
          ],
          type: "Polygon",
        },
      },
      mission_locale: {
        id: 418,
        nom: "DU PROVINOIS",
        siret: "42180445100035",
        localisation: {
          geopoint: {
            type: "Point",
            coordinates: [3.3027904, 48.560307],
          },
          adresse: "1, Cour des Bénédictins",
          cp: "77160",
          ville: "PROVINS",
        },
        contact: {
          email: "ml@mail.fr",
          telephone: "01 60 67 04 50",
          siteWeb: "https://www.milopro.fr/",
        },
      },
      nom: "Aubepierre-Ozouer-le-Repos",
      region: {
        codeInsee: "11",
        nom: "Île-de-France",
      },
      updated_at: new Date("2025-01-03T03:14:01.249Z"),
      arrondissements: [],
      anciennes: [
        {
          codeInsee: "77351",
          nom: "Ozouer-le-Repos",
        },
      ],
    },
    {
      _id: new ObjectId(),
      code: {
        insee: "13055",
        postaux: [
          "13001",
          "13002",
          "13003",
          "13004",
          "13005",
          "13006",
          "13007",
          "13008",
          "13009",
          "13010",
          "13011",
          "13012",
          "13013",
          "13014",
          "13015",
          "13016",
        ],
      },
      academie: {
        nom: "Aix-Marseille",
        id: "A02",
        code: "02",
      },
      created_at: new Date("2024-11-28T15:47:27.885Z"),
      departement: {
        nom: "Bouches-du-Rhône",
        codeInsee: "13",
      },
      localisation: {
        centre: {
          coordinates: [5.3806, 43.2803],
          type: "Point",
        },
        bbox: {
          coordinates: [
            [
              [5.228734, 43.169626],
              [5.532543, 43.169626],
              [5.532543, 43.391057],
              [5.228734, 43.391057],
              [5.228734, 43.169626],
            ],
          ],
          type: "Polygon",
        },
      },
      mission_locale: {
        id: 323,
        nom: "DE MARSEILLE",
        siret: "41035534100042",
        localisation: {
          geopoint: {
            type: "Point",
            coordinates: [5.3904529, 43.2834795],
          },
          adresse: "23 avenue de Corinthe",
          cp: "13006",
          ville: "MARSEILLE",
        },
        contact: {
          email: "siege@mail.fr",
          telephone: "04 91 19 01 20",
          siteWeb: "https://missionlocalemarseille.fr/",
        },
      },
      nom: "Marseille",
      region: {
        codeInsee: "93",
        nom: "Provence-Alpes-Côte d'Azur",
      },
      updated_at: new Date("2025-01-03T03:14:01.249Z"),
      arrondissements: [
        {
          code: "13201",
          nom: "Marseille 1er Arrondissement",
        },
        {
          code: "13202",
          nom: "Marseille 2e Arrondissement",
        },
        {
          code: "13203",
          nom: "Marseille 3e Arrondissement",
        },
        {
          code: "13204",
          nom: "Marseille 4e Arrondissement",
        },
        {
          code: "13205",
          nom: "Marseille 5e Arrondissement",
        },
        {
          code: "13206",
          nom: "Marseille 6e Arrondissement",
        },
        {
          code: "13207",
          nom: "Marseille 7e Arrondissement",
        },
        {
          code: "13208",
          nom: "Marseille 8e Arrondissement",
        },
        {
          code: "13209",
          nom: "Marseille 9e Arrondissement",
        },
        {
          code: "13210",
          nom: "Marseille 10e Arrondissement",
        },
        {
          code: "13211",
          nom: "Marseille 11e Arrondissement",
        },
        {
          code: "13212",
          nom: "Marseille 12e Arrondissement",
        },
        {
          code: "13213",
          nom: "Marseille 13e Arrondissement",
        },
        {
          code: "13214",
          nom: "Marseille 14e Arrondissement",
        },
        {
          code: "13215",
          nom: "Marseille 15e Arrondissement",
        },
        {
          code: "13216",
          nom: "Marseille 16e Arrondissement",
        },
      ],
      anciennes: [],
    },
  ];

  beforeEach(async () => {
    await getDbCollection("commune").insertMany(communes);
  });

  const source1 = {
    code_commune_insee: "13055",
    lieu_formation_geo_coordonnees: "5.3919076,43.2701626",
    lieu_formation_geo_coordonnees_computed: "5.3847529,43.2734432",
    lieu_formation_adresse: "9 Sq. Michelet",
    code_postal: "13009",
    distance: 684,
    etablissement_lieu_formation_siret: "13002526500013",
    etablissement_lieu_formation_uai: "0694669A",
  };

  const expected1 = {
    adresse: {
      label: source1.lieu_formation_adresse,
      code_postal: source1.code_postal,

      commune: {
        nom: communes[1].nom,
        code_insee: communes[1].code.insee,
      },
      departement: {
        nom: communes[1].departement.nom,
        code_insee: communes[1].departement.codeInsee,
      },
      region: {
        code_insee: communes[1].region.codeInsee,
        nom: communes[1].region.nom,
      },
      academie: {
        id: communes[1].academie.id,
        code: communes[1].academie.code,
        nom: communes[1].academie.nom,
      },
    },

    geolocalisation: {
      type: "Point",
      coordinates: [43.2701626, 5.3919076],
    },

    precision: source1.distance,

    siret: source1.etablissement_lieu_formation_siret,
    uai: source1.etablissement_lieu_formation_uai,
  };

  it("should build formation lieu", async () => {
    const result = await buildFormationLieu(source1);

    expect(result).toEqual(expected1);
  });

  it("should find commune with a code arrondissement", async () => {
    const result = await buildFormationLieu({
      ...source1,
      code_commune_insee: "13209",
    });

    expect(result).toEqual(expected1);
  });

  it("should find commune with code_postel if code_commune_insee is not found", async () => {
    const result = await buildFormationLieu({
      ...source1,
      code_commune_insee: "unknown",
    });

    expect(result).toEqual(expected1);
  });

  it("should find commune with even for merged ones", async () => {
    const result = await buildFormationLieu({
      ...source1,
      code_commune_insee: "77351",
    });

    expect(result).toEqual({
      ...expected1,
      adresse: {
        ...expected1.adresse,
        commune: {
          nom: communes[0].nom,
          code_insee: communes[0].code.insee,
        },
        departement: {
          nom: communes[0].departement.nom,
          code_insee: communes[0].departement.codeInsee,
        },
        region: {
          code_insee: communes[0].region.codeInsee,
          nom: communes[0].region.nom,
        },
        academie: {
          id: communes[0].academie.id,
          code: communes[0].academie.code,
          nom: communes[0].academie.nom,
        },
      },
    });
  });

  it("should throw if commune is not found", async () => {
    await expect(
      buildFormationLieu({
        ...source1,
        code_commune_insee: "unknown",
        code_postal: "unknown",
      })
    ).rejects.toThrowError("buildFormationLieu: commune not found");
  });

  it('should fallback to "lieu_formation_geo_coordonnees_computed" if "lieu_formation_geo_coordonnees" is invalid', async () => {
    const result = await buildFormationLieu({
      ...source1,
      lieu_formation_geo_coordonnees: "invalid",
    });

    expect(result).toEqual({
      ...expected1,
      geolocalisation: {
        type: "Point",
        coordinates: [43.2734432, 5.3847529],
      },
    });
  });

  it('should throw if "lieu_formation_geo_coordonnees" and "lieu_formation_geo_coordonnees_computed" are invalid', async () => {
    await expect(
      buildFormationLieu({
        ...source1,
        lieu_formation_geo_coordonnees: "invalid",
        lieu_formation_geo_coordonnees_computed: "invalid",
      })
    ).rejects.toThrowError("buildFormationLieu: invalid geo coordinates");
  });

  it("should ignore siret if it is invalid", async () => {
    const result = await buildFormationLieu({
      ...source1,
      etablissement_lieu_formation_siret: "invalid",
    });

    expect(result).toEqual({
      ...expected1,
      siret: null,
    });
  });

  it("should ignore uai if it is invalid", async () => {
    const result = await buildFormationLieu({
      ...source1,
      etablissement_lieu_formation_uai: "invalid",
    });

    expect(result).toEqual({
      ...expected1,
      uai: null,
    });
  });
});
