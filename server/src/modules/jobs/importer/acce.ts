import {
  // filterData,
  oleoduc,
  transformIntoStream,
  writeData,
} from "oleoduc";
import { IAcce } from "shared/models/acce/acce.model";
import unzip from "unzip-stream";

import parentLogger from "@/common/logger";

import { streamCsvExtraction } from "../../../common/apis/acce";
import { getDbCollection } from "../../../common/utils/mongodbUtils";
import { parseCsv } from "../../../common/utils/parserUtils";

const logger = parentLogger.child({ module: "importer:acce" });

// 17/01/2024 151_510 records
export const run_acce_importer = async () => {
  logger.info("Geting ACCE file...");

  const stream = await streamCsvExtraction();
  const stats = {
    total: 0,
    created: 0,
    updated: 0,
    failed: 0,
  };

  logger.info("Import ACCE data starting...");

  await oleoduc(
    stream,
    unzip.Parse(),
    transformIntoStream(async (data) => {
      console.log(data);
      // await oleoduc(
      //   data,
      //   parseCsv(),
      //   writeData((obj) => console.log(obj))
      // );
      return data; //Return a stream
    })
    // writeData((obj) => console.log(obj))
  );
  exit;
  await oleoduc(
    stream,
    parseCsv(),
    writeData(
      async (data: Omit<IAcce, "_id" | "updated_at" | "created_at">) => {
        try {
          const res = await getDbCollection("acce").updateOne(
            { numero_uai: data.numero_uai },
            {
              $set: {
                ...data,
                created_at: new Date(),
                updated_at: new Date(),
              },
            },
            { upsert: true }
          );

          stats.updated += res.modifiedCount;
          stats.created += res.upsertedCount;
        } catch (e) {
          console.log(e.errInfo.details.schemaRulesNotSatisfied[0]);
          logger.error(e, `Impossible d'importer l'établissement ${data.numero_uai}`);
          stats.failed++;
        }
      },
      { parallel: 10 }
    )
  );

  return stats;
};
