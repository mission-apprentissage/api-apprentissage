import { PassThrough } from "node:stream";

import etl from "etl";
import { oleoduc, writeData } from "oleoduc";
import { IAcce } from "shared/models/acce/acce.model";
import { IAcceSpecificite } from "shared/models/acce/acce.specificite.part";
import { IAcceZone } from "shared/models/acce/acce.zone.part";
import unzipper from "unzipper";

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

  const acce_uai = new PassThrough();
  const acce_uai_spec = new PassThrough();
  const acce_uai_zone = new PassThrough();
  const acce_uai_mere = new PassThrough();
  const acce_uai_fille = new PassThrough();

  stream.pipe(unzipper.Parse()).pipe(
    etl.map((entry: any) => {
      console.log(entry.path);
      if (entry.path == "ACCE_UAI.csv") return entry.pipe(acce_uai);
      else if (entry.path == "ACCE_UAI_SPEC.csv") return entry.pipe(acce_uai_spec);
      else if (entry.path == "ACCE_UAI_ZONE.csv") return entry.pipe(acce_uai_zone);
      else if (entry.path == "ACCE_UAI_MERE.csv") return entry.pipe(acce_uai_mere);
      else if (entry.path == "ACCE_UAI_FILLE.csv") return entry.pipe(acce_uai_fille);
      else entry.autodrain();
    })
  );

  await oleoduc(
    acce_uai,
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

  await oleoduc(
    acce_uai_spec,
    parseCsv(),
    writeData(
      async (data: Omit<IAcce, "_id" | "updated_at" | "created_at"> & IAcceSpecificite) => {
        await getDbCollection("acce").updateOne(
          { numero_uai: data.numero_uai },
          {
            $set: {
              specificite: {
                specificite_uai: data.specificite_uai,
                specificite_uai_libe: data.specificite_uai_libe,
                date_ouverture: data.date_ouverture,
                date_fermeture: data.date_fermeture,
              },
              updated_at: new Date(),
            },
          },
          { upsert: true }
        );
      },
      { parallel: 10 }
    )
  );

  await oleoduc(
    acce_uai_zone,
    parseCsv(),
    writeData(
      async (data: Omit<IAcce, "_id" | "updated_at" | "created_at"> & IAcceZone) => {
        await getDbCollection("acce").updateOne(
          { numero_uai: data.numero_uai },
          {
            $set: {
              zone: {
                type_zone_uai: data.type_zone_uai,
                type_zone_uai_libe: data.type_zone_uai_libe,
                zone: data.zone,
                zone_libe: data.zone_libe,
                date_ouverture: data.date_ouverture,
                date_fermeture: data.date_fermeture,
                date_derniere_mise_a_jour: data.date_derniere_mise_a_jour,
              },
              updated_at: new Date(),
            },
          },
          { upsert: true }
        );
      },
      { parallel: 10 }
    )
  );
  await oleoduc(
    acce_uai_mere,
    parseCsv(),
    writeData(
      async (data: Omit<IAcce, "_id" | "updated_at" | "created_at"> & { type_rattachement: string }) => {
        await getDbCollection("acce").updateOne(
          { numero_uai: data.numero_uai },
          {
            $set: {
              numero_uai_mere: data.numero_uai_mere,
              type_rattachement_mere: data.type_rattachement,
              updated_at: new Date(),
            },
          },
          { upsert: true }
        );
      },
      { parallel: 10 }
    )
  );
  await oleoduc(
    acce_uai_fille,
    parseCsv(),
    writeData(
      async (data: Omit<IAcce, "_id" | "updated_at" | "created_at"> & { type_rattachement: string }) => {
        await getDbCollection("acce").updateOne(
          { numero_uai: data.numero_uai },
          {
            $set: {
              numero_uai_fille: data.numero_uai_fille,
              type_rattachement_fille: data.type_rattachement,
              updated_at: new Date(),
            },
          },
          { upsert: true }
        );
      },
      { parallel: 10 }
    )
  );

  return stats;
};
