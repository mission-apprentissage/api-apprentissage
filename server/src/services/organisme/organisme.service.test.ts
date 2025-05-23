import { useMongo } from "@tests/mongo.test.utils.js";
import { ObjectId } from "mongodb";
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import type { IOrganismeReferentielDataInput } from "shared/models/fixtures/index";
import { generateOrganismeReferentielFixture, generateSourceReferentiel } from "shared/models/fixtures/index";
import type { ISourceReferentiel } from "shared/models/source/referentiel/source.referentiel.model";
import { zSourceReferentiel } from "shared/models/source/referentiel/source.referentiel.model";
import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import tdbFiabResultData from "./fixtures/tdb/fiabilisation.fixture.json" with { type: "json" };
import tdbReferentielFixtureData from "./fixtures/tdb/referentiel.fixture.json" with { type: "json" };
import type { OrganismeSearchQuery } from "./organisme.service.js";
import { searchOrganisme, searchOrganismeMetadata } from "./organisme.service.js";

const _zTdbFiabResult = z.discriminatedUnion("type", [
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

type ITdbFiabResult = z.infer<typeof _zTdbFiabResult>;

useMongo("beforeEach");

describe("searchOrganisme", () => {
  describe("tdb retro-compatibility", () => {
    const date = new Date("2024-04-19T00:00:00Z");
    const organismesReferentiels: ISourceReferentiel[] = (
      tdbReferentielFixtureData as IOrganismeReferentielDataInput[]
    ).map((data: IOrganismeReferentielDataInput) =>
      zSourceReferentiel.parse({
        _id: new ObjectId(),
        date,
        data: generateOrganismeReferentielFixture(data),
      })
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tdbFiabResults: ITdbFiabResult[] = tdbFiabResultData as any;

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

  describe("recherche par SIRET uniquement", () => {
    const query = {
      uai: null,
      siret: "77562556900014",
    } as const satisfies OrganismeSearchQuery;

    const uai1 = "0491801S";
    const uai2 = "0594899E";
    const siret1 = "19850144700025";

    describe("Si un UNIQUE organisme est trouvé par SIRET", () => {
      it("alors l'organisme est trouvé", async () => {
        const organismes = [
          generateOrganismeReferentielFixture({
            uai: uai1,
            siret: query.siret,
            etat_administratif: "actif",
          }),
          generateOrganismeReferentielFixture({
            uai: uai2,
            siret: siret1,
            etat_administratif: "actif",
          }),
        ];

        await getDbCollection("source.referentiel").insertMany(
          organismes.map((data) => generateSourceReferentiel({ data }))
        );

        const result = await searchOrganisme(query);
        expect(result).toEqual({
          candidats: [],
          resultat: {
            status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
            correspondances: {
              uai: null,
              siret: { lui_meme: true, son_formateur: false, son_responsable: false },
            },
            organisme: { identifiant: { uai: organismes[0].uai, siret: organismes[0].siret } },
          },
        });
      });

      describe("Si un AUCUN organisme est trouvé par SIRET", () => {
        it("alors l'organisme n'est pas trouvé", async () => {
          const organismes = [
            generateOrganismeReferentielFixture({
              uai: uai2,
              siret: siret1,
              etat_administratif: "actif",
            }),
          ];

          await getDbCollection("source.referentiel").insertMany(
            organismes.map((data) => generateSourceReferentiel({ data }))
          );

          const result = await searchOrganisme(query);
          expect(result).toEqual({
            candidats: [],
            resultat: null,
          });
        });
      });

      describe("sinon les organismes trouvés par SIRET sont ajoutés à la liste de candidats", () => {
        it("alors l'organisme n'est pas trouvé", async () => {
          const organismes = [
            generateOrganismeReferentielFixture({
              uai: uai1,
              siret: query.siret,
              etat_administratif: "actif",
            }),
            generateOrganismeReferentielFixture({
              uai: uai2,
              siret: siret1,
              etat_administratif: "actif",
            }),
            generateOrganismeReferentielFixture({
              uai: uai2,
              siret: query.siret,
              etat_administratif: "actif",
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
                  uai: null,
                  siret: { lui_meme: true, son_formateur: false, son_responsable: false },
                },
                organisme: { identifiant: { uai: organismes[0].uai, siret: organismes[0].siret } },
              },
              {
                status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                correspondances: {
                  uai: null,
                  siret: { lui_meme: true, son_formateur: false, son_responsable: false },
                },
                organisme: { identifiant: { uai: organismes[2].uai, siret: organismes[2].siret } },
              },
            ],
            resultat: null,
          });
        });
      });
    });
  });

  describe("recherche par UAI uniquement", () => {
    const query = {
      uai: "0596776V",
      siret: null,
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

    describe("Si AU MOINS UN organisme est trouvé par UAI avec SIRET différent", () => {
      describe("Les organismes trouvé par UAI sont ajoutés à la liste des candidats", () => {
        const candidats = [
          {
            status: { ouvert: false, declaration_catalogue: true, validation_uai: true },
            correspondances: {
              uai: { lui_meme: true, son_lieu: false },
              siret: null,
            },
            organisme: { identifiant: { uai: query.uai, siret: siret1 } },
          },
          {
            status: { ouvert: true, declaration_catalogue: false, validation_uai: true },
            correspondances: {
              uai: { lui_meme: true, son_lieu: false },
              siret: null,
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
                  siret: null,
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
                    siret: null,
                  },
                  organisme: { identifiant: { uai: query.uai, siret: siret3 } },
                },
              ],
              resultat: {
                status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                correspondances: {
                  uai: { lui_meme: true, son_lieu: true },
                  siret: null,
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
                    siret: null,
                  },
                  organisme: { identifiant: { uai: query.uai, siret: siret3 } },
                },
                {
                  status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                  correspondances: {
                    uai: { lui_meme: true, son_lieu: true },
                    siret: null,
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
              siret: null,
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
                  siret: null,
                },
                organisme: { identifiant: { uai: uai2, siret: siret1 } },
              },
              {
                status: { ouvert: true, declaration_catalogue: true, validation_uai: true },
                correspondances: {
                  uai: { lui_meme: false, son_lieu: true },
                  siret: null,
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

  describe('recherche par "uai" et "siret" null', () => {
    const query = {
      uai: null,
      siret: null,
    } as const satisfies OrganismeSearchQuery;

    it("alors l'organisme n'est pas trouvé", async () => {
      await getDbCollection("source.referentiel").insertOne(generateSourceReferentiel());
      const result = await searchOrganisme(query);

      expect(result).toEqual({
        candidats: [],
        resultat: null,
      });
    });
  });
});

describe("searchOrganismeMetadata", () => {
  const uai1 = "0491801S";
  const uai2 = "0594899E";
  const uai3 = "0631408N";
  const uai4 = "0851372E";
  const siret1 = "19850144700025";
  const siret2 = "26590673500120";
  const siret3 = "98222438800016";
  const siret4 = "88951250500013";

  beforeEach(async () => {
    disableNetConnect();

    await getDbCollection("source.referentiel").insertMany([
      generateSourceReferentiel({
        data: generateOrganismeReferentielFixture({
          uai: uai1,
          siret: siret1,
          etat_administratif: "actif",
        }),
      }),
      generateSourceReferentiel({
        data: generateOrganismeReferentielFixture({
          uai: uai2,
          siret: siret2,
          etat_administratif: "fermé",
          lieux_de_formation: [{ uai: uai3 }],
        }),
      }),
    ]);

    return () => {
      cleanAll();
      enableNetConnect();
    };
  });

  describe('recherche par "uai" et "siret" null', () => {
    it("alors les metadata sont vides", async () => {
      const query = {
        uai: null,
        siret: null,
      } as const satisfies OrganismeSearchQuery;

      const result = await searchOrganismeMetadata(query);

      expect(result).toEqual({ uai: null, siret: null });
    });
  });

  describe("si l'UAI est un UAI organisme", () => {
    it("alors le status de l'UAI est ok", async () => {
      const query = {
        uai: uai1,
        siret: null,
      } as const satisfies OrganismeSearchQuery;

      const result = await searchOrganismeMetadata(query);

      expect(result).toEqual({ uai: { status: "ok" }, siret: null });
    });
  });

  describe("si l'UAI est trouvé dans un UAI lieu", () => {
    it("alors le status de l'UAI est ok", async () => {
      const query = {
        uai: uai3,
        siret: null,
      } as const satisfies OrganismeSearchQuery;

      const result = await searchOrganismeMetadata(query);

      expect(result).toEqual({ uai: { status: "ok" }, siret: null });
    });
  });

  describe("si l'UAI n'est pas trouvé", () => {
    it('alors le status de l"UAI est "inconnu"', async () => {
      const query = {
        uai: uai4,
        siret: null,
      } as const satisfies OrganismeSearchQuery;

      const result = await searchOrganismeMetadata(query);

      expect(result).toEqual({ uai: { status: "inconnu" }, siret: null });
    });
  });

  describe("si le SIRET correspond à un organisme ouvert", () => {
    it('alors le status du "siret" est "ok"', async () => {
      const query = {
        uai: null,
        siret: siret1,
      } as const satisfies OrganismeSearchQuery;

      const result = await searchOrganismeMetadata(query);

      expect(result).toEqual({ uai: null, siret: { status: "ok" } });
    });
  });

  describe("si le SIRET correspond à un organisme fermé", () => {
    it('alors le status du "siret" est "fermé"', async () => {
      const query = {
        uai: null,
        siret: siret2,
      } as const satisfies OrganismeSearchQuery;

      const result = await searchOrganismeMetadata(query);

      expect(result).toEqual({ uai: null, siret: { status: "fermé" } });
    });
  });

  describe("si le SIRET n'est pas trouvé", () => {
    describe("si le SIRET est trouvé dans l'API entreprise", () => {
      describe('si l\'etat_administratif est "actif"', () => {
        it('alors le status du "siret" est "ok"', async () => {
          const query = {
            uai: null,
            siret: siret3,
          } as const satisfies OrganismeSearchQuery;

          const scope = nock("https://entreprise.api.gouv.fr/v3");
          scope
            .get(`/insee/sirene/etablissements/diffusibles/${siret3}`)
            .query({
              token: "key",
              context: "MNA",
              recipient: "13002526500013",
              object: "Consolidation des données",
            })
            .reply(200, {
              data: {
                siret: siret3,
                siege_social: true,
                etat_administratif: "A",
                date_fermeture: null,
                enseigne: null,
                activite_principale: {
                  code: "62.09Z",
                  nomenclature: "NAFRev2",
                  libelle: "Autres activités informatiques",
                },
                tranche_effectif_salarie: {
                  de: null,
                  a: null,
                  code: null,
                  date_reference: null,
                  intitule: null,
                },
                diffusable_commercialement: true,
                status_diffusion: "diffusible",
                date_creation: 1704150000,
                unite_legale: {
                  siren: "982224388",
                  rna: null,
                  siret_siege_social: "98222438800016",
                  type: "personne_morale",
                  personne_morale_attributs: {
                    raison_sociale: "UPSCALE2I",
                    sigle: null,
                  },
                  personne_physique_attributs: {
                    pseudonyme: null,
                    prenom_usuel: null,
                    prenom_1: null,
                    prenom_2: null,
                    prenom_3: null,
                    prenom_4: null,
                    nom_usage: null,
                    nom_naissance: null,
                    sexe: null,
                  },
                  categorie_entreprise: null,
                  status_diffusion: "diffusible",
                  diffusable_commercialement: true,
                  forme_juridique: {
                    code: "5710",
                    libelle: "SAS, société par actions simplifiée",
                  },
                  activite_principale: {
                    code: "62.09Z",
                    nomenclature: "NAFRev2",
                    libelle: "Autres activités informatiques",
                  },
                  tranche_effectif_salarie: {
                    de: null,
                    a: null,
                    code: null,
                    date_reference: null,
                    intitule: null,
                  },
                  economie_sociale_et_solidaire: false,
                  date_creation: 1704150000,
                  etat_administratif: "A",
                },
                adresse: {
                  status_diffusion: "diffusible",
                  complement_adresse: null,
                  numero_voie: "5",
                  indice_repetition_voie: null,
                  type_voie: "ALLÉE",
                  libelle_voie: "LOUIS CLOART",
                  code_postal: "59290",
                  libelle_commune: "WASQUEHAL",
                  libelle_commune_etranger: null,
                  distribution_speciale: null,
                  code_commune: "59646",
                  code_cedex: null,
                  libelle_cedex: null,
                  code_pays_etranger: null,
                  libelle_pays_etranger: null,
                  acheminement_postal: {
                    l1: "UPSCALE2I",
                    l2: "",
                    l3: "",
                    l4: "5 ALLÉE LOUIS CLOART",
                    l5: "",
                    l6: "59290 WASQUEHAL",
                    l7: "FRANCE",
                  },
                },
              },
              links: {
                unite_legale: "https://entreprise.api.gouv.fr/v3/insee/sirene/unites_legales/982224388",
              },
              meta: {
                date_derniere_mise_a_jour: 1712700000,
                redirect_from_siret: null,
              },
            });

          const result = await searchOrganismeMetadata(query);

          expect(result).toEqual({ uai: null, siret: { status: "ok" } });
        });
      });

      describe('si l\'etat_administratif est "fermé"', () => {
        it('alors le status du "siret" est "fermé"', async () => {
          const query = {
            uai: null,
            siret: siret4,
          } as const satisfies OrganismeSearchQuery;

          const scope = nock("https://entreprise.api.gouv.fr/v3");
          scope
            .get(`/insee/sirene/etablissements/diffusibles/${siret4}`)
            .query({
              token: "key",
              context: "MNA",
              recipient: "13002526500013",
              object: "Consolidation des données",
            })
            .reply(200, {
              data: {
                siret: "88951250500013",
                siege_social: true,
                etat_administratif: "F",
                date_fermeture: 1640905200,
                enseigne: null,
                activite_principale: {
                  code: "62.02A",
                  nomenclature: "NAFRev2",
                  libelle: "Conseil en systèmes et logiciels informatiques",
                },
                tranche_effectif_salarie: {
                  de: null,
                  a: null,
                  code: null,
                  date_reference: null,
                  intitule: null,
                },
                diffusable_commercialement: true,
                status_diffusion: "diffusible",
                date_creation: 1593554400,
                unite_legale: {
                  siren: "889512505",
                  rna: null,
                  siret_siege_social: "88951250500013",
                  type: "personne_morale",
                  personne_morale_attributs: {
                    raison_sociale: "SIDE BY SIDE",
                    sigle: null,
                  },
                  personne_physique_attributs: {
                    pseudonyme: null,
                    prenom_usuel: null,
                    prenom_1: null,
                    prenom_2: null,
                    prenom_3: null,
                    prenom_4: null,
                    nom_usage: null,
                    nom_naissance: null,
                    sexe: null,
                  },
                  categorie_entreprise: "PME",
                  status_diffusion: "diffusible",
                  diffusable_commercialement: true,
                  forme_juridique: {
                    code: "5710",
                    libelle: "SAS, société par actions simplifiée",
                  },
                  activite_principale: {
                    code: "62.02A",
                    nomenclature: "NAFRev2",
                    libelle: "Conseil en systèmes et logiciels informatiques",
                  },
                  tranche_effectif_salarie: {
                    de: null,
                    a: null,
                    code: null,
                    date_reference: null,
                    intitule: null,
                  },
                  economie_sociale_et_solidaire: false,
                  date_creation: 1593554400,
                  etat_administratif: "C",
                },
                adresse: {
                  status_diffusion: "diffusible",
                  complement_adresse: "APPARTEMENT 21",
                  numero_voie: "1",
                  indice_repetition_voie: "ter",
                  type_voie: "IMPASSE",
                  libelle_voie: "PASSOIR",
                  code_postal: "92110",
                  libelle_commune: "CLICHY",
                  libelle_commune_etranger: null,
                  distribution_speciale: null,
                  code_commune: "92024",
                  code_cedex: null,
                  libelle_cedex: null,
                  code_pays_etranger: null,
                  libelle_pays_etranger: null,
                  acheminement_postal: {
                    l1: "SIDE BY SIDE",
                    l2: "",
                    l3: "APPARTEMENT 21",
                    l4: "1 TER IMPASSE PASSOIR",
                    l5: "",
                    l6: "92110 CLICHY",
                    l7: "FRANCE",
                  },
                },
              },
              links: {
                unite_legale: "https://entreprise.api.gouv.fr/v3/insee/sirene/unites_legales/889512505",
              },
              meta: {
                date_derniere_mise_a_jour: 1711062000,
                redirect_from_siret: null,
              },
            });

          const result = await searchOrganismeMetadata(query);

          expect(result).toEqual({ uai: null, siret: { status: "fermé" } });
        });
      });

      describe("si une erreur est retournée par l'API entreprise", () => {
        it('alors le status du "siret" est "inconnu"', async () => {
          const query = {
            uai: null,
            siret: "8030051560004",
          } as const satisfies OrganismeSearchQuery;

          const scope = nock("https://entreprise.api.gouv.fr/v3");
          scope
            .get(`/insee/sirene/etablissements/diffusibles/8030051560004`)
            .query({
              token: "key",
              context: "MNA",
              recipient: "13002526500013",
              object: "Consolidation des données",
            })
            .reply(422, {
              errors: [
                {
                  code: "00302",
                  title: "Entité non traitable",
                  detail: "Le numéro de siret n'est pas correctement formatté",
                  source: {
                    parameter: "siret",
                  },
                  meta: {},
                },
              ],
            });

          const result = await searchOrganismeMetadata(query);

          expect(result).toEqual({ uai: null, siret: { status: "inconnu" } });
        });
      });
    });
  });
});
