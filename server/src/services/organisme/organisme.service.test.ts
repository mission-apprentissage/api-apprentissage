import { useMongo } from "@tests/mongo.test.utils";
import { ObjectId } from "mongodb";
import { generateOrganismeReferentielFixture, IOrganismeReferentielDataInput } from "shared/models/fixtures";
import { ISourceReferentiel, zSourceReferentiel } from "shared/models/source/referentiel/source.referentiel.model";
import { beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { clearAllCollections, getDbCollection } from "@/services/mongodb/mongodbService";

import tdbFiabResultData from "./fixtures/tdb/fiabilisation.fixture.json?raw" assert { type: "json" };
import tdbReferentielFixtureData from "./fixtures/tdb/referentiel.fixture.json?raw" assert { type: "json" };
import { searchOrganisme } from "./organisme.service";

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

describe("searchOrganisme", () => {
  useMongo("beforeAll");

  const date = new Date("2024-04-19T00:00:00Z");
  const organismesReferentiels: ISourceReferentiel[] = JSON.parse(tdbReferentielFixtureData).map(
    (data: IOrganismeReferentielDataInput) =>
      zSourceReferentiel.parse({
        _id: new ObjectId(),
        date,
        data: generateOrganismeReferentielFixture(data),
      })
  );

  describe("tdb retro-compatibility", () => {
    const tdbFiabResults: ITdbFiabResult[] = JSON.parse(tdbFiabResultData);

    beforeAll(async () => {
      await getDbCollection("source.referentiel").insertMany(organismesReferentiels);

      return () => clearAllCollections();
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
    }, 200_000);
  });
});
