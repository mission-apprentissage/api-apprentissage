import { useMongo } from "@tests/mongo.test.utils";
import { ObjectId } from "mongodb";
import {
  generateOrganismeReferentielFixture,
  generateSourceReferentiel,
  IOrganismeReferentielDataInput,
} from "shared/models/fixtures";
import { ISourceReferentiel, zSourceReferentiel } from "shared/models/source/referentiel/source.referentiel.model";
import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { getDbCollection } from "@/services/mongodb/mongodbService";

import tdbFiabResultData from "./fixtures/tdb/fiabilisation.fixture.json?raw" assert { type: "json" };
import tdbReferentielFixtureData from "./fixtures/tdb/referentiel.fixture.json?raw" assert { type: "json" };
import { OrganismeSearchQuery, searchOrganisme } from "./organisme.service";

const zTdbFiabResult = z.discriminatedUnion("type", [
  z.object({
    siret: z.string(),
    uai: z.string(),
    type: z.literal("FIABLE"),
    rule_id: z.literal(1),
  }),
  z.object({
    siret: z.string(),
    uai: z.string(),
    type: z.literal("A_FIABILISER"),
    siret_fiable: z.string(),
    uai_fiable: z.string(),
    rule_id: z.union([z.literal(0), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(8)]),
  }),
  z.object({
    siret: z.string(),
    uai: z.string(),
    type: z.literal("NON_FIABILISABLE_PB_COLLECTE"),
    rule_id: z.literal(7),
  }),
  z.object({
    siret: z.string(),
    uai: z.string(),
    type: z.enum(["NON_FIABILISABLE_UAI_VALIDEE", "NON_FIABILISABLE_UAI_NON_VALIDEE"]),
    rule_id: z.literal(9),
  }),
]);

type ITdbFiabResult = z.infer<typeof zTdbFiabResult>;

useMongo("beforeEach");

describe("searchOrganisme", () => {
  describe("tdb retro-compatibility", () => {
    const date = new Date("2024-04-19T00:00:00Z");
    const organismesReferentiels: ISourceReferentiel[] = JSON.parse(tdbReferentielFixtureData).map(
      (data: IOrganismeReferentielDataInput) =>
        zSourceReferentiel.parse({
          _id: new ObjectId(),
          date,
          data: generateOrganismeReferentielFixture(data),
        })
    );

    const tdbFiabResults: ITdbFiabResult[] = JSON.parse(tdbFiabResultData);

    beforeEach(async () => {
      await getDbCollection("source.referentiel").insertMany(organismesReferentiels);
    });

    it("should be backward compatible", async () => {
      const inconsistency = [];
      const fauxPositifs = [];
      const fauxNegatifs = [];

      const uaiLieuToUaiFormateur = new Map<string, string>();
      const uaiFormateurs = new Set(organismesReferentiels.map(({ data }) => data.uai));
      for (const organismesReferentiel of organismesReferentiels) {
        for (const lieu of organismesReferentiel.data.lieux_de_formation) {
          if (lieu.uai && !uaiFormateurs.has(lieu.uai) && organismesReferentiel.data.uai) {
            uaiLieuToUaiFormateur.set(lieu.uai, organismesReferentiel.data.uai);
          }
        }
      }

      for (const tdbResult of tdbFiabResults) {
        const { siret, uai, rule_id } = tdbResult;
        const result = await searchOrganisme({ siret, uai });

        let expectedSiret: string | null = null;
        let expectedUai: string | null = null;
        let isExpectedLieu: boolean = false;

        if (tdbResult.type === "FIABLE") {
          expectedSiret = tdbResult.siret;
          expectedUai = tdbResult.uai;
        } else if (tdbResult.type === "A_FIABILISER") {
          isExpectedLieu = uaiLieuToUaiFormateur.has(tdbResult.uai_fiable);
          expectedSiret = tdbResult.siret_fiable;
          expectedUai = uaiLieuToUaiFormateur.get(tdbResult.uai_fiable) ?? tdbResult.uai_fiable;
        }

        if (result.resultat) {
          const resultSiret = result.resultat.organisme.identifiant.siret;
          const resultUai = result.resultat.organisme.identifiant.uai;

          if (tdbResult.type === "FIABLE" || tdbResult.type === "A_FIABILISER") {
            if (resultSiret !== expectedSiret || resultUai !== expectedUai) {
              inconsistency.push({
                siret,
                uai,
                resultSiret,
                resultUai,
                expectedSiret,
                expectedUai,
                isExpectedLieu,
                rule_id,
              });
            }
          } else {
            fauxPositifs.push({
              siret,
              uai,
              resultSiret,
              resultUai,
              type: tdbResult.type,
              isExpectedLieu,
              rule_id,
            });
          }
        } else {
          if (tdbResult.type === "FIABLE" || tdbResult.type === "A_FIABILISER") {
            fauxNegatifs.push({
              siret,
              uai,
              type: tdbResult.type,
              expectedSiret,
              expectedUai,
              isExpectedLieu,
              rule_id,
            });
          }
        }
      }

      expect
        .soft({
          fauxNegatifs: fauxNegatifs.length,
          fauxPositifs: fauxPositifs.length,
          inconsistency: inconsistency.length,
        })
        .toEqual({ fauxNegatifs: 9, fauxPositifs: 17, inconsistency: 6 });

      expect.soft({ fauxPositifs }).toMatchSnapshot();

      expect.soft({ inconsistency }).toMatchSnapshot();

      expect.soft({ fauxNegatifs }).toMatchSnapshot();
    });
  });

  describe("recherche par couple UAI-SIRET", () => {
    const query = {
      uai: "0596776V",
      siret: "77562556900014",
    } as const satisfies OrganismeSearchQuery;

    const uai1 = "0491801S";
    const uai2 = "0594899E";
    const uai3 = "0631408N";
    const uai4 = "0851372E";
    const siret1 = "19850144700025";
    const siret2 = "26590673500120";
    const siret3 = "81002887800017";
    const siret4 = "91849224000026";
    const siret5 = "91812606100038";

    describe("si l'organisme est trouvé par le couple UAI-SIRET", () => {
      describe("si l'organisme est ouvert", () => {
        beforeEach(async () => {
          const data = generateOrganismeReferentielFixture({
            uai: query.uai,
            siret: query.siret,
            etat_administratif: "actif",
          });
          const sourceReferentiel = generateSourceReferentiel({ data });

          await getDbCollection("source.referentiel").insertOne(sourceReferentiel);
        });

        it("alors l'organisme est trouvé", async () => {
          const result = await searchOrganisme(query);
          expect(result).toEqual({
            candidats: [],
            resultat: {
              status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
              correspondances: {
                uai: { lui_meme: true, son_lieu: false },
                siret: { lui_meme: true, son_formateur: false, son_responsable: false },
              },
              organisme: { identifiant: { uai: query.uai, siret: query.siret } },
            },
          });
        });
      });

      describe("sinon si l’organisme a un des ses lieux correspondant à l’UAI recherché", () => {
        beforeEach(async () => {
          const data = generateOrganismeReferentielFixture({
            uai: query.uai,
            siret: query.siret,
            etat_administratif: "fermé",
            lieux_de_formation: [{ uai: query.uai }, { uai: uai1 }],
          });
          const sourceReferentiel = generateSourceReferentiel({ data });

          await getDbCollection("source.referentiel").insertOne(sourceReferentiel);
        });

        it("alors l'organisme est trouvé", async () => {
          const result = await searchOrganisme(query);
          expect(result).toEqual({
            candidats: [],
            resultat: {
              status: { ouvert: false, declaration_catalogue: true, validation_uai: true },
              correspondances: {
                uai: { lui_meme: true, son_lieu: true },
                siret: { lui_meme: true, son_formateur: false, son_responsable: false },
              },
              organisme: { identifiant: { uai: query.uai, siret: query.siret } },
            },
          });
        });
      });

      it("sinon l'organisme est ajouté à la liste des candidats", async () => {
        const data = generateOrganismeReferentielFixture({
          uai: query.uai,
          siret: query.siret,
          etat_administratif: "fermé",
          lieux_de_formation: [{ uai: uai1 }],
        });
        const sourceReferentiel = generateSourceReferentiel({ data });

        await getDbCollection("source.referentiel").insertOne(sourceReferentiel);
        const result = await searchOrganisme(query);

        expect(result).toEqual({
          candidats: [
            {
              status: { ouvert: false, declaration_catalogue: true, validation_uai: true },
              correspondances: {
                uai: { lui_meme: true, son_lieu: false },
                siret: { lui_meme: true, son_formateur: false, son_responsable: false },
              },
              organisme: { identifiant: { uai: query.uai, siret: query.siret } },
            },
          ],
          resultat: null,
        });
      });
    });

    describe("Si AUCUN organisme n’est trouvé par SIRET avec UAI  différent", () => {
      describe("Si AU MOINS UN organisme est trouvé par UAI avec SIRET différent", () => {
        describe("Les organismes trouvé par UAI sont ajoutés à la liste des candidats", () => {
          const candidats = [
            {
              status: { ouvert: false, declaration_catalogue: true, validation_uai: true },
              correspondances: {
                uai: { lui_meme: true, son_lieu: false },
                siret: { lui_meme: false, son_formateur: false, son_responsable: false },
              },
              organisme: { identifiant: { uai: query.uai, siret: siret1 } },
            },
            {
              status: { ouvert: true, declaration_catalogue: false, validation_uai: true },
              correspondances: {
                uai: { lui_meme: true, son_lieu: false },
                siret: { lui_meme: false, son_formateur: false, son_responsable: false },
              },
              organisme: { identifiant: { uai: query.uai, siret: siret2 } },
            },
          ];

          beforeEach(async () => {
            await getDbCollection("source.referentiel").insertMany([
              generateSourceReferentiel({
                data: generateOrganismeReferentielFixture({
                  uai: candidats[0].organisme.identifiant.uai,
                  siret: candidats[0].organisme.identifiant.siret,
                  etat_administratif: "fermé",
                }),
              }),
              generateSourceReferentiel({
                data: generateOrganismeReferentielFixture({
                  uai: candidats[1].organisme.identifiant.uai,
                  siret: candidats[1].organisme.identifiant.siret,
                  etat_administratif: "actif",
                  nature: "inconnue",
                }),
              }),
            ]);
          });

          describe("Si AUCUN organisme n’est à la fois: trouvé par UAI; ouvert et présent dans le catalogue", async () => {
            it("alors l'organisme n'est pas trouvé", async () => {
              const result = await searchOrganisme(query);

              expect(result).toEqual({
                candidats,
                resultat: null,
              });
            });
          });

          describe("Si un UNIQUE organisme trouvé parmis la liste précédente", () => {
            beforeEach(async () => {
              await getDbCollection("source.referentiel").insertOne(
                generateSourceReferentiel({
                  data: generateOrganismeReferentielFixture({
                    uai: query.uai,
                    siret: siret3,
                    etat_administratif: "actif",
                    nature: "responsable_formateur",
                  }),
                })
              );
            });

            it("alors l'organisme est trouvé", async () => {
              const result = await searchOrganisme(query);

              expect(result).toEqual({
                candidats,
                resultat: {
                  status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                  correspondances: {
                    uai: { lui_meme: true, son_lieu: false },
                    siret: { lui_meme: false, son_formateur: false, son_responsable: false },
                  },
                  organisme: { identifiant: { uai: query.uai, siret: siret3 } },
                },
              });
            });
          });

          describe("Si un UNIQUE organisme parmis la liste précédente est trouvé par UAI lieu", () => {
            beforeEach(async () => {
              await getDbCollection("source.referentiel").insertMany([
                generateSourceReferentiel({
                  data: generateOrganismeReferentielFixture({
                    uai: query.uai,
                    siret: siret3,
                    etat_administratif: "actif",
                    nature: "responsable_formateur",
                    lieux_de_formation: [{ uai: uai1 }],
                  }),
                }),
                generateSourceReferentiel({
                  data: generateOrganismeReferentielFixture({
                    uai: query.uai,
                    siret: siret4,
                    etat_administratif: "actif",
                    nature: "responsable_formateur",
                    lieux_de_formation: [{ uai: query.uai }],
                  }),
                }),
              ]);
            });

            it("alors l'organisme est trouvé", async () => {
              const result = await searchOrganisme(query);

              expect(result).toEqual({
                candidats: [
                  ...candidats,
                  {
                    status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                    correspondances: {
                      uai: { lui_meme: true, son_lieu: false },
                      siret: { lui_meme: false, son_formateur: false, son_responsable: false },
                    },
                    organisme: { identifiant: { uai: query.uai, siret: siret3 } },
                  },
                ],
                resultat: {
                  status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                  correspondances: {
                    uai: { lui_meme: true, son_lieu: true },
                    siret: { lui_meme: false, son_formateur: false, son_responsable: false },
                  },
                  organisme: { identifiant: { uai: query.uai, siret: siret4 } },
                },
              });
            });
          });

          describe("sinon", () => {
            beforeEach(async () => {
              await getDbCollection("source.referentiel").insertOne(
                generateSourceReferentiel({
                  data: generateOrganismeReferentielFixture({
                    uai: query.uai,
                    siret: siret3,
                    etat_administratif: "actif",
                    nature: "responsable_formateur",
                    lieux_de_formation: [{ uai: query.uai }],
                  }),
                })
              );
              await getDbCollection("source.referentiel").insertOne(
                generateSourceReferentiel({
                  data: generateOrganismeReferentielFixture({
                    uai: query.uai,
                    siret: siret4,
                    etat_administratif: "actif",
                    nature: "responsable_formateur",
                    lieux_de_formation: [{ uai: query.uai }],
                  }),
                })
              );
            });

            it("alors l'organisme n'est pas trouvé", async () => {
              const result = await searchOrganisme(query);

              expect(result).toEqual({
                candidats: [
                  ...candidats,
                  {
                    status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                    correspondances: {
                      uai: { lui_meme: true, son_lieu: true },
                      siret: { lui_meme: false, son_formateur: false, son_responsable: false },
                    },
                    organisme: { identifiant: { uai: query.uai, siret: siret3 } },
                  },
                  {
                    status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                    correspondances: {
                      uai: { lui_meme: true, son_lieu: true },
                      siret: { lui_meme: false, son_formateur: false, son_responsable: false },
                    },
                    organisme: { identifiant: { uai: query.uai, siret: siret4 } },
                  },
                ],
                resultat: null,
              });
            });
          });
        });
      });

      describe("Si un UNIQUE organisme est à la fois: trouvé par UAI lieu; ouvert et validé par le référentiel (UAI non null)", () => {
        it("alors l'organisme est trouvé", async () => {
          await getDbCollection("source.referentiel").insertMany([
            generateSourceReferentiel({
              data: generateOrganismeReferentielFixture({
                uai: uai2,
                siret: siret1,
                etat_administratif: "actif",
                lieux_de_formation: [{ uai: query.uai }],
              }),
            }),
            generateSourceReferentiel({
              data: generateOrganismeReferentielFixture({
                uai: uai3,
                siret: siret2,
                etat_administratif: "fermé",
                lieux_de_formation: [{ uai: query.uai }],
              }),
            }),
          ]);

          const result = await searchOrganisme(query);

          expect(result).toEqual({
            candidats: [],
            resultat: {
              status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
              correspondances: {
                uai: { lui_meme: false, son_lieu: true },
                siret: { lui_meme: false, son_formateur: false, son_responsable: false },
              },
              organisme: { identifiant: { uai: uai2, siret: siret1 } },
            },
          });
        });

        describe("sinon Les organismes trouvés par UAI lieux sont ajoutés à la liste des candidats", () => {
          it("alors l'organisme n'est pas trouvé", async () => {
            await getDbCollection("source.referentiel").insertMany([
              generateSourceReferentiel({
                data: generateOrganismeReferentielFixture({
                  uai: uai2,
                  siret: siret1,
                  etat_administratif: "actif",
                  lieux_de_formation: [{ uai: query.uai }],
                }),
              }),
              generateSourceReferentiel({
                data: generateOrganismeReferentielFixture({
                  uai: uai3,
                  siret: siret2,
                  etat_administratif: "fermé",
                  lieux_de_formation: [{ uai: query.uai }],
                }),
              }),
              generateSourceReferentiel({
                data: generateOrganismeReferentielFixture({
                  uai: uai4,
                  siret: siret5,
                  etat_administratif: "actif",
                  lieux_de_formation: [{ uai: query.uai }],
                }),
              }),
            ]);

            const result = await searchOrganisme(query);

            expect(result).toEqual({
              candidats: [
                {
                  status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                  correspondances: {
                    uai: { lui_meme: false, son_lieu: true },
                    siret: { lui_meme: false, son_formateur: false, son_responsable: false },
                  },
                  organisme: { identifiant: { uai: uai2, siret: siret1 } },
                },
                {
                  status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                  correspondances: {
                    uai: { lui_meme: false, son_lieu: true },
                    siret: { lui_meme: false, son_formateur: false, son_responsable: false },
                  },
                  organisme: { identifiant: { uai: uai4, siret: siret5 } },
                },
              ],
              resultat: null,
            });
          });
        });
      });
    });

    describe("sinon Les organismes trouvés par UAI et ceux trouvés par SIRET sont ajoutés à la liste de candidats", () => {
      describe("Si un UNIQUE organisme est trouvé par SIRET avec UAI différent", () => {
        describe("Si l’organisme trouvé par SIRET a un lieu correspondant à l’UAI recherché", () => {
          it("alors l'organisme est trouvé", async () => {
            const organismes = [
              generateOrganismeReferentielFixture({
                uai: uai1,
                siret: query.siret,
                etat_administratif: "actif",
                lieux_de_formation: [{ uai: query.uai }],
              }),
              generateOrganismeReferentielFixture({
                uai: query.uai,
                siret: siret1,
                etat_administratif: "actif",
                lieux_de_formation: [{ uai: query.uai }],
              }),
              generateOrganismeReferentielFixture({
                uai: uai2,
                siret: siret2,
                etat_administratif: "actif",
                lieux_de_formation: [{ uai: query.uai }],
              }),
            ];

            await getDbCollection("source.referentiel").insertMany(
              organismes.map((data) => generateSourceReferentiel({ data }))
            );

            const result = await searchOrganisme(query);

            expect(result).toEqual({
              candidats: [
                {
                  status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                  correspondances: {
                    uai: { lui_meme: true, son_lieu: true },
                    siret: { lui_meme: false, son_formateur: false, son_responsable: false },
                  },
                  organisme: { identifiant: { uai: organismes[1].uai, siret: organismes[1].siret } },
                },
              ],
              resultat: {
                status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                correspondances: {
                  uai: { lui_meme: false, son_lieu: true },
                  siret: { lui_meme: true, son_formateur: false, son_responsable: false },
                },
                organisme: { identifiant: { uai: organismes[0].uai, siret: organismes[0].siret } },
              },
            });
          });
        });

        describe("Si un UNIQUE organisme est trouvé par UAI lieu", () => {
          describe("Si l’organisme n’a pour UAI celui recherché ET que le SIRET de correspond à celui du responsable", () => {
            it("alors L’organisme est trouvé (celui du responsable)", async () => {
              const organismes = [
                generateOrganismeReferentielFixture({
                  uai: uai1,
                  siret: query.siret,
                  etat_administratif: "actif",
                  lieux_de_formation: [{ uai: uai2 }],
                }),
                generateOrganismeReferentielFixture({
                  uai: query.uai,
                  siret: siret1,
                  etat_administratif: "actif",
                  lieux_de_formation: [{ uai: uai3 }],
                }),
                generateOrganismeReferentielFixture({
                  uai: uai2,
                  siret: siret2,
                  etat_administratif: "actif",
                  lieux_de_formation: [{ uai: query.uai }],
                  relations: [{ siret: query.siret, type: "formateur->responsable" }],
                }),
              ];

              await getDbCollection("source.referentiel").insertMany(
                organismes.map((data) => generateSourceReferentiel({ data }))
              );

              const result = await searchOrganisme(query);

              expect(result).toEqual({
                candidats: [
                  {
                    status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                    correspondances: {
                      uai: { lui_meme: true, son_lieu: false },
                      siret: { lui_meme: false, son_formateur: false, son_responsable: false },
                    },
                    organisme: { identifiant: { uai: organismes[1].uai, siret: organismes[1].siret } },
                  },
                ],
                resultat: {
                  status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                  correspondances: {
                    uai: { lui_meme: false, son_lieu: false },
                    siret: { lui_meme: true, son_formateur: false, son_responsable: false },
                  },
                  organisme: { identifiant: { uai: organismes[0].uai, siret: organismes[0].siret } },
                },
              });
            });

            describe("sinon l’organisme est trouvé (celui du lieu)", () => {
              it("si l'organisme a pour UAI celui recherché et que le SIRET correspond à celui du responsable", async () => {
                const organismes = [
                  generateOrganismeReferentielFixture({
                    uai: uai1,
                    siret: query.siret,
                    etat_administratif: "actif",
                    lieux_de_formation: [{ uai: uai2 }],
                  }),
                  generateOrganismeReferentielFixture({
                    uai: query.uai,
                    siret: siret1,
                    etat_administratif: "actif",
                    lieux_de_formation: [{ uai: uai3 }],
                  }),
                  generateOrganismeReferentielFixture({
                    uai: query.uai,
                    siret: siret2,
                    etat_administratif: "actif",
                    lieux_de_formation: [{ uai: query.uai }],
                    relations: [{ siret: query.siret, type: "formateur->responsable" }],
                  }),
                ];

                await getDbCollection("source.referentiel").insertMany(
                  organismes.map((data) => generateSourceReferentiel({ data }))
                );

                const result = await searchOrganisme(query);

                expect(result).toEqual({
                  candidats: [
                    {
                      status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                      correspondances: {
                        uai: { lui_meme: false, son_lieu: false },
                        siret: { lui_meme: true, son_formateur: false, son_responsable: false },
                      },
                      organisme: { identifiant: { uai: organismes[0].uai, siret: organismes[0].siret } },
                    },
                    {
                      status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                      correspondances: {
                        uai: { lui_meme: true, son_lieu: false },
                        siret: { lui_meme: false, son_formateur: false, son_responsable: false },
                      },
                      organisme: { identifiant: { uai: organismes[1].uai, siret: organismes[1].siret } },
                    },
                  ],
                  resultat: {
                    status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                    correspondances: {
                      uai: { lui_meme: true, son_lieu: true },
                      siret: { lui_meme: false, son_formateur: false, son_responsable: true },
                    },
                    organisme: { identifiant: { uai: organismes[2].uai, siret: organismes[2].siret } },
                  },
                });
              });

              it("si l'organisme a pour UAI celui recherché et que le SIRET ne correspond PAS à celui du responsable", async () => {
                const organismes = [
                  generateOrganismeReferentielFixture({
                    uai: uai1,
                    siret: query.siret,
                    etat_administratif: "actif",
                    lieux_de_formation: [{ uai: uai2 }],
                  }),
                  generateOrganismeReferentielFixture({
                    uai: query.uai,
                    siret: siret1,
                    etat_administratif: "actif",
                    lieux_de_formation: [{ uai: uai3 }],
                  }),
                  generateOrganismeReferentielFixture({
                    uai: query.uai,
                    siret: siret2,
                    etat_administratif: "actif",
                    lieux_de_formation: [{ uai: query.uai }],
                    relations: [{ siret: siret4, type: "formateur->responsable" }],
                  }),
                ];

                await getDbCollection("source.referentiel").insertMany(
                  organismes.map((data) => generateSourceReferentiel({ data }))
                );

                const result = await searchOrganisme(query);

                expect(result).toEqual({
                  candidats: [
                    {
                      status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                      correspondances: {
                        uai: { lui_meme: false, son_lieu: false },
                        siret: { lui_meme: true, son_formateur: false, son_responsable: false },
                      },
                      organisme: { identifiant: { uai: organismes[0].uai, siret: organismes[0].siret } },
                    },
                    {
                      status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                      correspondances: {
                        uai: { lui_meme: true, son_lieu: false },
                        siret: { lui_meme: false, son_formateur: false, son_responsable: false },
                      },
                      organisme: { identifiant: { uai: organismes[1].uai, siret: organismes[1].siret } },
                    },
                  ],
                  resultat: {
                    status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                    correspondances: {
                      uai: { lui_meme: true, son_lieu: true },
                      siret: { lui_meme: false, son_formateur: false, son_responsable: false },
                    },
                    organisme: { identifiant: { uai: organismes[2].uai, siret: organismes[2].siret } },
                  },
                });
              });

              it("si l'organisme n'a PAS pour UAI celui recherché et que le SIRET correspond à celui du responsable", async () => {
                const organismes = [
                  generateOrganismeReferentielFixture({
                    uai: uai1,
                    siret: query.siret,
                    etat_administratif: "actif",
                    lieux_de_formation: [{ uai: uai2 }],
                  }),
                  generateOrganismeReferentielFixture({
                    uai: query.uai,
                    siret: siret1,
                    etat_administratif: "actif",
                    lieux_de_formation: [{ uai: uai3 }],
                  }),
                  generateOrganismeReferentielFixture({
                    uai: uai4,
                    siret: siret2,
                    etat_administratif: "actif",
                    lieux_de_formation: [{ uai: query.uai }],
                    relations: [{ siret: siret4, type: "formateur->responsable" }],
                  }),
                ];

                await getDbCollection("source.referentiel").insertMany(
                  organismes.map((data) => generateSourceReferentiel({ data }))
                );

                const result = await searchOrganisme(query);

                expect(result).toEqual({
                  candidats: [
                    {
                      status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                      correspondances: {
                        uai: { lui_meme: false, son_lieu: false },
                        siret: { lui_meme: true, son_formateur: false, son_responsable: false },
                      },
                      organisme: { identifiant: { uai: organismes[0].uai, siret: organismes[0].siret } },
                    },
                    {
                      status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                      correspondances: {
                        uai: { lui_meme: true, son_lieu: false },
                        siret: { lui_meme: false, son_formateur: false, son_responsable: false },
                      },
                      organisme: { identifiant: { uai: organismes[1].uai, siret: organismes[1].siret } },
                    },
                  ],
                  resultat: {
                    status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                    correspondances: {
                      uai: { lui_meme: false, son_lieu: true },
                      siret: { lui_meme: false, son_formateur: false, son_responsable: false },
                    },
                    organisme: { identifiant: { uai: organismes[2].uai, siret: organismes[2].siret } },
                  },
                });
              });
            });
          });
        });
      });
    });
  });
});
