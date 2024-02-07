import { PassThrough } from "node:stream";

import etl from "etl";
import {
  // mergeStreams,
  concatStreams,
  oleoduc,
  writeData,
} from "oleoduc";
import { IAcce } from "shared/models/acce/acce.model";
// import { IAcceSpecificite } from "shared/models/acce/acce.specificite.part";
// import { IAcceZone } from "shared/models/acce/acce.zone.part";
import unzipper from "unzipper";

import parentLogger from "@/common/logger";

import { streamCsvExtraction } from "../../../common/apis/acce";
import { getDbCollection } from "../../../common/utils/mongodbUtils";
import { parseCsv } from "../../../common/utils/parserUtils";

const logger = parentLogger.child({ module: "import:acce" });

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
      // if (entry.path == "ACCE_UAI.csv") return entry.pipe(acce_uai);
      // else
      if (entry.path == "ACCE_UAI_SPEC.csv") return entry.pipe(acce_uai_spec);
      else if (entry.path == "ACCE_UAI_ZONE.csv") return entry.pipe(acce_uai_zone);
      // else if (entry.path == "ACCE_UAI_MERE.csv") return entry.pipe(acce_uai_mere);
      // else if (entry.path == "ACCE_UAI_FILLE.csv") return entry.pipe(acce_uai_mere);
      else entry.autodrain();
    })
  );
  // stream.pipe(unzipper.Parse()).pipe(
  //   etl.map((entry: any) => {
  //     console.log(entry.path);
  //     if (entry.path == "ACCE_UAI_SPEC.csv") return entry.pipe(acce_uai_spec);
  //     else entry.autodrain();
  //   })
  // );
  // stream.pipe(unzipper.Parse()).pipe(
  //   etl.map((entry: any) => {
  //     console.log(entry.path);
  //     if (entry.path == "ACCE_UAI_ZONE.csv") return entry.pipe(acce_uai_zone);
  //     else entry.autodrain();
  //   })
  // );

  // stream.pipe(unzipper.Parse()).pipe(
  //   etl.map((entry: any) => {
  //     console.log(entry.path);
  //     if (entry.path == "ACCE_UAI_MERE.csv") {
  //       return entry.pipe(acce_uai_mere);
  //     } else entry.autodrain();
  //   })
  // );
  // stream.pipe(unzipper.Parse()).pipe(
  //   etl.map((entry: any) => {
  //     console.log(entry.path);
  //     if (entry.path == "ACCE_UAI_FILLE.csv") return entry.pipe(acce_uai_fille);
  //     else entry.autodrain();
  //   })
  // );

  await oleoduc(
    concatStreams(
      // acce_uai,
      acce_uai_spec,
      acce_uai_zone
      // acce_uai_mere,
      // acce_uai_fille
    ),
    parseCsv(),
    writeData(
      async (data: Omit<IAcce, "_id" | "updated_at" | "created_at">) => {
        try {
          // logger.info(`Uai > Update ${data.numero_uai}`);

          // if (!data.specificite_uai) {
          //   await getDbCollection("source.acce").updateOne(
          //     { numero_uai: data.numero_uai },
          //     {
          //       $set: {
          //         ...data,
          //         zones: [],
          //         specificites: [],
          //         updated_at: new Date(),
          //       },
          //       $setOnInsert: {
          //         created_at: new Date(),
          //       },
          //     },
          //     { upsert: true }
          //   );
          // } else

          // console.log(data);

          const numero_uai = data.numero_uai_trouve ?? data.numero_uai;
          const specificites = {
            ...(data.specificite_uai ? { specificite_uai: data.specificite_uai } : {}),
            ...(data.specificite_uai_libe ? { specificite_uai_libe: data.specificite_uai_libe } : {}),
            ...(data.date_ouverture && (data.specificite_uai || data.specificite_uai_libe)
              ? { date_ouverture: data.date_ouverture }
              : {}),
            ...(data.date_fermeture && (data.specificite_uai || data.specificite_uai_libe)
              ? { date_fermeture: data.date_fermeture }
              : {}),
          };

          const zones = {
            ...(data.type_zone_uai ? { type_zone_uai: data.type_zone_uai } : {}),
            ...(data.type_zone_uai_libe ? { type_zone_uai_libe: data.type_zone_uai_libe } : {}),
            ...(data.zone ? { zone: data.zone } : {}),
            ...(data.zone_libe ? { zone_libe: data.zone_libe } : {}),
            ...(data.date_ouverture && (data.type_zone_uai || data.type_zone_uai_libe || data.zone || data.zone_libe)
              ? { date_ouverture: data.date_ouverture }
              : {}),
            ...(data.date_fermeture && (data.type_zone_uai || data.type_zone_uai_libe || data.zone || data.zone_libe)
              ? { date_fermeture: data.date_fermeture }
              : {}),
            ...(data.date_derniere_mise_a_jour ? { date_derniere_mise_a_jour: data.date_derniere_mise_a_jour } : {}),
          };

          const $addToSet = {
            ...(Object.keys(specificites).length && !Object.keys(zones).length ? { specificites } : {}),
            ...(Object.keys(zones).length && !Object.keys(specificites).length ? { zones } : {}),
          };

          console.log({
            $set: {
              ...(data.numero_uai_mere ? { numero_uai_mere: data.numero_uai_mere } : {}),
              ...(data.type_rattachement && data.numero_uai_mere
                ? { type_rattachement_mere: data.type_rattachement }
                : {}),
              ...(data.numero_uai_fille ? { numero_uai_fille: data.numero_uai_fille } : {}),
              ...(data.type_rattachement && data.numero_uai_fille
                ? { type_rattachement_fille: data.type_rattachement }
                : {}),
              updated_at: new Date(),
            },
            ...(Object.keys($addToSet).length ? { $addToSet } : {}),
            $setOnInsert: {
              created_at: new Date(),
              // zones: [],
              // specificites: [],
            },
          });

          await getDbCollection("source.acce").updateOne(
            { numero_uai },
            {
              $set: {
                ...(data.numero_uai_mere ? { numero_uai_mere: data.numero_uai_mere } : {}),
                ...(data.type_rattachement && data.numero_uai_mere
                  ? { type_rattachement_mere: data.type_rattachement }
                  : {}),
                ...(data.numero_uai_fille ? { numero_uai_fille: data.numero_uai_fille } : {}),
                ...(data.type_rattachement && data.numero_uai_fille
                  ? { type_rattachement_fille: data.type_rattachement }
                  : {}),
                updated_at: new Date(),
              },
              ...(Object.keys($addToSet).length ? { $addToSet } : {}),
              $setOnInsert: {
                created_at: new Date(),
              },
            },
            { upsert: true }
          );
        } catch (e) {
          console.log(e.errInfo?.details?.schemaRulesNotSatisfied[0]);
          logger.error(e, `Impossible d'importer l'établissement ${data.numero_uai}`);
          stats.failed++;
        }
      }
      // { parallel: 10 }
    )
  );

  // await oleoduc(
  //   acce_uai_spec,
  //   parseCsv(),
  //   writeData(
  //     async (data: Omit<IAcce, "_id" | "updated_at" | "created_at"> & IAcceSpecificite) => {
  //       logger.info(`Spec > Update ${data.numero_uai}`);
  //       await getDbCollection("source.acce").updateOne(
  //         { numero_uai: data.numero_uai },
  //         {
  //           $set: {
  //             updated_at: new Date(),
  //           },
  //           $addToSet: {
  //             specificites: {
  //               ...(data.specificite_uai ? { specificite_uai: data.specificite_uai } : {}),
  //               ...(data.specificite_uai_libe ? { specificite_uai_libe: data.specificite_uai_libe } : {}),
  //               ...(data.date_ouverture ? { date_ouverture: data.date_ouverture } : {}),
  //               ...(data.date_fermeture ? { date_fermeture: data.date_fermeture } : {}),
  //             },
  //           },
  //           $setOnInsert: {
  //             created_at: new Date(),
  //           },
  //         },
  //         { upsert: true }
  //       );
  //     },
  //     { parallel: 10 }
  //   )
  // );

  // await oleoduc(
  //   acce_uai_zone,
  //   parseCsv(),
  //   writeData(
  //     async (data: Omit<IAcce, "_id" | "updated_at" | "created_at"> & IAcceZone) => {
  //       try {
  //         logger.info(`zone > Update ${data.numero_uai}`);
  //         await getDbCollection("source.acce").updateOne(
  //           { numero_uai: data.numero_uai },
  //           {
  //             $set: {
  //               updated_at: new Date(),
  //             },
  //             $addToSet: {
  //               zones: {
  //                 ...(data.type_zone_uai ? { type_zone_uai: data.type_zone_uai } : {}),
  //                 ...(data.type_zone_uai_libe ? { type_zone_uai_libe: data.type_zone_uai_libe } : {}),
  //                 ...(data.zone ? { zone: data.zone } : {}),
  //                 ...(data.zone_libe ? { zone_libe: data.zone_libe } : {}),
  //                 ...(data.date_ouverture ? { date_ouverture: data.date_ouverture } : {}),
  //                 ...(data.date_fermeture ? { date_fermeture: data.date_fermeture } : {}),
  //                 ...(data.date_derniere_mise_a_jour
  //                   ? { date_derniere_mise_a_jour: data.date_derniere_mise_a_jour }
  //                   : {}),
  //               },
  //             },
  //             $setOnInsert: {
  //               created_at: new Date(),
  //             },
  //           },
  //           { upsert: true }
  //         );
  //       } catch (e) {
  //         console.log(e.errInfo.details.schemaRulesNotSatisfied[0]);
  //       }
  //     },
  //     { parallel: 10 }
  //   )
  // );
  // await oleoduc(
  //   acce_uai_mere,
  //   parseCsv(),
  //   writeData(
  //     async (
  //       data: Omit<IAcce, "_id" | "updated_at" | "created_at"> & {
  //         numero_uai_trouve: string;
  //         type_rattachement: string;
  //       }
  //     ) => {
  //       logger.info(`mere > Update ${data.numero_uai_trouve}`);
  //       await getDbCollection("source.acce").updateOne(
  //         { numero_uai: data.numero_uai_trouve },
  //         {
  //           $set: {
  //             ...(data.numero_uai_mere ? { numero_uai_mere: data.numero_uai_mere } : {}),
  //             ...(data.type_rattachement ? { type_rattachement_mere: data.type_rattachement } : {}),
  //             updated_at: new Date(),
  //           },
  //           $setOnInsert: {
  //             created_at: new Date(),
  //           },
  //         },
  //         { upsert: true }
  //       );
  //     },
  //     { parallel: 10 }
  //   )
  // );

  // await oleoduc(
  //   acce_uai_fille,
  //   parseCsv(),
  //   writeData(
  //     async (
  //       data: Omit<IAcce, "_id" | "updated_at" | "created_at"> & {
  //         numero_uai_trouve: string;
  //         type_rattachement: string;
  //       }
  //     ) => {
  //       logger.info(`fille > Update ${data.numero_uai_trouve}`);
  //       await getDbCollection("source.acce").updateOne(
  //         { numero_uai: data.numero_uai_trouve },
  //         {
  //           $set: {
  //             ...(data.numero_uai_fille ? { numero_uai_fille: data.numero_uai_fille } : {}),
  //             ...(data.type_rattachement ? { type_rattachement_fille: data.type_rattachement } : {}),
  //             updated_at: new Date(),
  //           },
  //           $setOnInsert: {
  //             created_at: new Date(),
  //           },
  //         },
  //         { upsert: true }
  //       );
  //     },
  //     { parallel: 10 }
  //   )
  // );

  return stats;
};
