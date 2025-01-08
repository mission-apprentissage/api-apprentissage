import { useMongo } from "@tests/mongo.test.utils.js";
import type { ICertificationFixtureInput } from "shared/models/fixtures/certification.model.fixture";
import { sourceCommuneFixtures } from "shared/models/fixtures/commune.model.fixture";
import type { IFormationFixtureInput } from "shared/models/fixtures/formation.model.fixture";
import { generateFormationFixture } from "shared/models/fixtures/formation.model.fixture";
import { describe, expect, it } from "vitest";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { searchFormation } from "./formation.service.js";

useMongo();

describe("searchFormation", () => {
  it("should return formations limited by query limit", async () => {
    const formations = [];
    for (let i = 0; i < 101; i++) {
      formations.push(
        generateFormationFixture({
          identifiant: { cle_ministere_educatif: i.toString() },
        })
      );
    }

    await getDbCollection("formation").insertMany(formations);

    const page1 = await searchFormation({
      radius: 0,
      page_size: 10,
      page_index: 0,
    });
    expect(page1.pagination).toEqual({
      page_count: 11,
      page_index: 0,
      page_size: 10,
    });
    expect(page1.data).toHaveLength(10);
    expect(page1.data.map(({ identifiant }) => identifiant.cle_ministere_educatif)).toEqual([
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ]);

    const page2 = await searchFormation({
      radius: 0,
      page_size: 10,
      page_index: 1,
    });
    expect(page2.pagination).toEqual({
      page_count: 11,
      page_index: 1,
      page_size: 10,
    });
    expect(page2.data).toHaveLength(10);
    expect(page2.data.map(({ identifiant }) => identifiant.cle_ministere_educatif)).toEqual([
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
    ]);

    const page11 = await searchFormation({
      radius: 0,
      page_size: 10,
      page_index: 10,
    });
    expect(page11.pagination).toEqual({
      page_count: 11,
      page_index: 10,
      page_size: 10,
    });
    expect(page11.data).toHaveLength(1);
    expect(page11.data.map(({ identifiant }) => identifiant.cle_ministere_educatif)).toEqual(["100"]);
  });

  it("should return only published formations", async () => {
    const formations = [
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "1" },
        statut: { catalogue: "publié" },
      }),
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "2" },
        statut: { catalogue: "archivé" },
      }),
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "3" },
        statut: { catalogue: "supprimé" },
      }),
    ];

    await getDbCollection("formation").insertMany(formations);

    const data = await searchFormation({
      radius: 0,
      page_size: 10,
      page_index: 0,
    });
    expect(data.pagination).toEqual({
      page_count: 1,
      page_index: 0,
      page_size: 10,
    });
    expect(data.data).toHaveLength(1);
  });

  it('should filter by "rome"', async () => {
    const formations = [
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "1" },
        certification: {
          connue: true,
          valeur: {
            domaines: {
              rome: {
                rncp: [
                  {
                    code: "A1201",
                    intitule: "Bûcheronnage et élagage",
                  },
                ],
              },
            },
          },
        },
      }),
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "2" },
        certification: {
          connue: true,
          valeur: {
            domaines: {
              rome: {
                rncp: [
                  {
                    code: "A1202",
                    intitule: "Entretien des espaces naturels",
                  },
                ],
              },
            },
          },
        },
      }),
    ];

    await getDbCollection("formation").insertMany(formations);

    const data = await searchFormation({
      radius: 0,
      romes: ["A1201"],
      page_size: 10,
      page_index: 0,
    });
    expect(data.pagination).toEqual({
      page_count: 1,
      page_index: 0,
      page_size: 10,
    });
    expect(data.data).toHaveLength(1);
    expect(data.data[0].identifiant).toEqual(formations[0].identifiant);
  });

  it('should filter by "rncp"', async () => {
    const formations = [
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "1" },
        certification: {
          connue: true,
          valeur: {
            identifiant: {
              rncp: "RNCP123",
            },
          },
        },
      }),
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "2" },
        certification: {
          connue: true,
          valeur: {
            identifiant: {
              rncp: "RNCP456",
            },
          },
        },
      }),
    ];

    await getDbCollection("formation").insertMany(formations);
    const data = await searchFormation({
      radius: 0,
      rncp: "RNCP456",
      page_size: 10,
      page_index: 0,
    });

    expect(data.pagination).toEqual({
      page_count: 1,
      page_index: 0,
      page_size: 10,
    });
    expect(data.data).toHaveLength(1);
    expect(data.data[0].identifiant).toEqual(formations[1].identifiant);
  });

  it("should filter by rome OR rncp", async () => {
    const formations = [
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "1" },
        certification: {
          connue: true,
          valeur: {
            identifiant: {
              rncp: "RNCP123",
            },
            domaines: {
              rome: {
                rncp: [
                  {
                    code: "A1201",
                    intitule: "Bûcheronnage et élagage",
                  },
                ],
              },
            },
          },
        },
      }),
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "2" },
        certification: {
          connue: true,
          valeur: {
            identifiant: {
              rncp: "RNCP123",
            },
            domaines: {
              rome: {
                rncp: [
                  {
                    code: "A1202",
                    intitule: "Entretien des espaces naturels",
                  },
                ],
              },
            },
          },
        },
      }),
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "3" },
        certification: {
          connue: true,
          valeur: {
            identifiant: {
              rncp: "RNCP456",
            },
            domaines: {
              rome: {
                rncp: [
                  {
                    code: "A1204",
                    intitule: "Protection du patrimoine naturel",
                  },
                ],
              },
            },
          },
        },
      }),
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "4" },
        certification: {
          connue: true,
          valeur: {
            identifiant: {
              rncp: "RNCP456",
            },
            domaines: {
              rome: {
                rncp: [
                  {
                    code: "A1301",
                    intitule: "Conseil et assistance technique en agriculture",
                  },
                ],
              },
            },
          },
        },
      }),
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "5" },
        certification: {
          connue: true,
          valeur: {
            identifiant: {
              rncp: "RNCP789",
            },
            domaines: {
              rome: {
                rncp: [
                  {
                    code: "A1301",
                    intitule: "Conseil et assistance technique en agriculture",
                  },
                ],
              },
            },
          },
        },
      }),
    ];

    await getDbCollection("formation").insertMany(formations);

    const data = await searchFormation({
      radius: 0,
      romes: ["A1201"],
      rncp: "RNCP456",
      page_size: 10,
      page_index: 0,
    });

    expect(data.pagination).toEqual({
      page_count: 1,
      page_index: 0,
      page_size: 10,
    });
    data.data.sort((a, b) => a.identifiant.cle_ministere_educatif.localeCompare(b.identifiant.cle_ministere_educatif));
    expect.soft(data.data).toHaveLength(3);
    expect.soft(data.data[0].identifiant).toEqual(formations[0].identifiant);
    expect.soft(data.data[1].identifiant).toEqual(formations[2].identifiant);
    expect.soft(data.data[2].identifiant).toEqual(formations[3].identifiant);
  });

  it('should filter by "target_diploma_level"', async () => {
    const formations = [
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "1" },
        certification: {
          connue: true,
          valeur: {
            intitule: {
              niveau: {
                rncp: {
                  europeen: "3",
                },
                cfd: null,
              },
            },
          },
        },
      }),
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "2" },
        certification: {
          connue: true,
          valeur: {
            intitule: {
              niveau: {
                rncp: {
                  europeen: "5",
                },
                cfd: null,
              },
            },
          },
        },
      }),
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "3" },
        certification: {
          connue: true,
          valeur: {
            intitule: {
              niveau: {
                rncp: null,
                cfd: {
                  europeen: "3",
                  formation_diplome: "500",
                  interministeriel: "5",
                  libelle: "DIPLOME LOCAL (DEPARTEMENTAL TOM ..)",
                  sigle: "CAP",
                },
              },
            },
          },
        },
      }),
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "4" },
        certification: {
          connue: true,
          valeur: {
            intitule: {
              niveau: {
                rncp: null,
                cfd: {
                  europeen: "5",
                  formation_diplome: "320",
                  interministeriel: "3",
                  libelle: "DIPLOME NATIONAL / DIPLOME D'ETAT",
                  sigle: "BTS",
                },
              },
            },
          },
        },
      }),
    ];

    await getDbCollection("formation").insertMany(formations);
    const data = await searchFormation({
      radius: 0,
      target_diploma_level: "3",
      page_size: 10,
      page_index: 0,
    });
    expect(data.pagination).toEqual({
      page_count: 1,
      page_index: 0,
      page_size: 10,
    });

    data.data.sort((a, b) => a.identifiant.cle_ministere_educatif.localeCompare(b.identifiant.cle_ministere_educatif));
    expect.soft(data.data).toHaveLength(2);
    expect.soft(data.data[0].identifiant).toEqual(formations[0].identifiant);
    expect.soft(data.data[1].identifiant).toEqual(formations[2].identifiant);
  });

  const melun = {
    type: "Point",
    coordinates: [2.6552, 48.5421],
  };

  it('should filter by "geolocalisation" and sort by distance', async () => {
    // Achères-la-Forêt --> Amilis: 60.2km
    // Achères-la-Forêt --> Paris: 59.1km
    // Amilis --> Paris: 59.8km

    // Melun --> Achères-la-Forêt: 22.6km
    // Melun --> Amilis: 41.5km
    // Melun --> Paris: 41.9km
    const formations = [
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "1" },
        lieu: {
          geolocalisation: sourceCommuneFixtures["77"][0].centre, // Achères-la-Forêt
        },
      }),
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "3" },
        lieu: {
          geolocalisation: sourceCommuneFixtures["75"][0].centre, // Paris
        },
      }),
      generateFormationFixture({
        identifiant: { cle_ministere_educatif: "2" },
        lieu: {
          geolocalisation: sourceCommuneFixtures["77"][1].centre, // Amillis
        },
      }),
    ];

    await getDbCollection("formation").insertMany(formations);
    const data1 = await searchFormation({
      radius: 30,
      longitude: melun.coordinates[0],
      latitude: melun.coordinates[1],
      page_size: 10,
      page_index: 0,
    }).catch((e) => {
      console.error(e);
      throw e;
    });

    expect(data1.pagination).toEqual({
      page_count: 1,
      page_index: 0,
      page_size: 10,
    });
    expect(data1.data.map(({ identifiant }) => identifiant)).toEqual([formations[0].identifiant]);

    const data2 = await searchFormation({
      radius: 50,
      longitude: melun.coordinates[0],
      latitude: melun.coordinates[1],
      page_size: 10,
      page_index: 0,
    });

    expect(data2.pagination).toEqual({
      page_count: 1,
      page_index: 0,
      page_size: 10,
    });
    expect(data2.data.map(({ identifiant }) => identifiant)).toEqual([
      formations[0].identifiant,
      formations[2].identifiant,
      formations[1].identifiant,
    ]);
  });

  it("should combine all filters", async () => {
    const lieux: IFormationFixtureInput["lieu"][] = [
      { geolocalisation: sourceCommuneFixtures["77"][0].centre }, // Achères-la-Forêt
      { geolocalisation: sourceCommuneFixtures["75"][0].centre }, // Paris
    ];

    const domaines: ICertificationFixtureInput["domaines"][] = [
      {
        rome: { rncp: [{ code: "A1201", intitule: "Bûcheronnage et élagage" }] },
      },
      {
        rome: { rncp: [{ code: "A1202", intitule: "Entretien des espaces naturels" }] },
      },
    ];

    const certifIdentifiants: ICertificationFixtureInput["identifiant"][] = [{ rncp: "RNCP123" }, { rncp: "RNCP456" }];

    const certifIntitule: ICertificationFixtureInput["intitule"][] = [
      { niveau: { rncp: { europeen: "3" }, cfd: null } },
      { niveau: { rncp: { europeen: "5" }, cfd: null } },
      {
        niveau: {
          rncp: null,
          cfd: {
            europeen: "3",
            formation_diplome: "500",
            interministeriel: "5",
            libelle: "DIPLOME LOCAL (DEPARTEMENTAL TOM ..)",
            sigle: "CAP",
          },
        },
      },
      {
        niveau: {
          rncp: null,
          cfd: {
            europeen: "5",
            formation_diplome: "320",
            interministeriel: "3",
            libelle: "DIPLOME NATIONAL / DIPLOME D'ETAT",
            sigle: "BTS",
          },
        },
      },
    ];

    const status: IFormationFixtureInput["statut"][] = [
      { catalogue: "publié" },
      { catalogue: "archivé" },
      { catalogue: "supprimé" },
    ];

    const formations = [];
    for (let i = 0; i < lieux.length; i++) {
      const lieu = lieux[i];
      for (let j = 0; j < domaines.length; j++) {
        const domaine = domaines[j];
        for (let k = 0; k < certifIdentifiants.length; k++) {
          const certifIdentifiant = certifIdentifiants[k];
          for (let l = 0; l < certifIntitule.length; l++) {
            const certifIntit = certifIntitule[l];
            for (let m = 0; m < status.length; m++) {
              const statut = status[m];
              formations.push(
                generateFormationFixture({
                  identifiant: { cle_ministere_educatif: `${i}-${j}-${k}-${l}-${m}` },
                  lieu,
                  certification: {
                    connue: true,
                    valeur: { domaines: domaine, identifiant: certifIdentifiant, intitule: certifIntit },
                  },
                  statut,
                })
              );
            }
          }
        }
      }
    }

    await getDbCollection("formation").insertMany(formations);
    const data = await searchFormation({
      radius: 30,
      longitude: melun.coordinates[0],
      latitude: melun.coordinates[1],
      romes: ["A1201"],
      rncp: "RNCP456",
      target_diploma_level: "3",
      page_size: 10,
      page_index: 0,
    });
    expect(data.pagination).toEqual({
      page_count: 1,
      page_index: 0,
      page_size: 10,
    });
    const cles = data.data.map(({ identifiant }) => identifiant.cle_ministere_educatif).toSorted();
    expect(cles).toEqual(["0-0-0-0-0", "0-0-0-2-0", "0-0-1-0-0", "0-0-1-2-0", "0-1-1-0-0", "0-1-1-2-0"]);
  });
});
