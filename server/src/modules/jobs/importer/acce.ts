import { filterData, oleoduc, writeData } from "oleoduc";

import parentLogger from "@/common/logger";

import { streamCsvExtraction } from "../../../common/apis/acce";
import { getDbCollection } from "../../../common/utils/mongodbUtils";
import { parseCsv } from "../../../common/utils/parserUtils";

const logger = parentLogger.child({ module: "importer:acce" });

const ETATS = {
  Ouvert: "1",
  "À fermer": "2",
  "À ouvrir": "3",
  Fermé: "4",
};

export const run_acce_importer = async () => {
  logger.info("Import ACCE data starting...");

  const stream = await streamCsvExtraction();
  const stats = {
    total: 0,
    created: 0,
    updated: 0,
    failed: 0,
  };

  await oleoduc(
    stream,
    parseCsv(),
    // @ts-expect-error: TODO
    filterData((data) => {
      stats.total++;
      return [ETATS["Ouvert"], ETATS["À ouvrir"]].includes(data.etat_etablissement);
      // && Object.values(NATURES).includes(data.nature_uai)
    }),
    writeData(
      // @ts-expect-error: TODO
      async (data) => {
        try {
          const res = await getDbCollection("acces").updateOne(
            { numero_uai: data.numero_uai },
            {
              $set: {
                ...data,
              },
            },
            { upsert: true }
          );

          stats.updated += res.modifiedCount;
          stats.created += res.upsertedCount;
        } catch (e) {
          logger.error(e, `Impossible d'importer l'établissement ${data.numero_uai}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
};
