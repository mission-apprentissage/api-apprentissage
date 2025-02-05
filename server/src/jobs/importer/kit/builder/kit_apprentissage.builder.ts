import { internal } from "@hapi/boom";
import type { AnyBulkWriteOperation } from "mongodb";
import { ObjectId } from "mongodb";
import type { ISourceKitApprentissage } from "shared/models/source/kitApprentissage/source.kit_apprentissage.model";
import { zKitApprentissage } from "shared/models/source/kitApprentissage/source.kit_apprentissage.model";

export function getVersionNumber(source: string): string {
  const matchVersion = /^Kit_apprentissage_(\d{8})\.(csv|xlsx)$/.exec(source);
  if (matchVersion) {
    return matchVersion[1];
  }

  switch (source) {
    case "Kit apprentissage et RNCP v1.0.csv":
      return "20200414";
    case "Kit apprentissage et RNCP v1.1.csv":
      return "20200507";
    case "Kit apprentissage et RNCP v1.2.csv":
      return "20200525";
    case "Kit apprentissage et RNCP v1.3.csv":
      return "20201116";
    case "Kit apprentissage et RNCP v1.4.csv":
      return "20201218";
    case "Kit apprentissage et RNCP v1.5.csv":
      return "20210302";
    case "Kit apprentissage et RNCP v1.6.csv":
      return "20210330";
    case "Kit apprentissage et RNCP v1.7.csv":
      return "20210503";
    case "Kit apprentissage et RNCP v1.8.csv":
      return "20210602";
    case "Kit apprentissage et RNCP v1.9.csv":
      return "20210707";
    case "Kit apprentissage et RNCP v2.0.csv":
      return "20210914";
    case "Kit apprentissage et RNCP v2.1.csv":
      return "20211019";
    case "Kit apprentissage et RNCP v2.2.csv":
      return "20211215";
    case "Kit apprentissage et RNCP v2.3.csv":
      return "20220126";
    case "Kit apprentissage et RNCP v2.4.csv":
      return "20220331";
    case "Kit apprentissage et RNCP v2.5.csv":
      return "20220518";
    case "Kit apprentissage et RNCP v2.6.csv":
      return "20220705";
    case "Kit apprentissage et RNCP v2.7.csv":
      return "20220908";
    case "Kit apprentissage et RNCP v2.8.csv":
      return "20221121";
    case "Kit apprentissage et RNCP v2.9.csv":
      return "20230223";
    case "Kit apprentissage et RNCP v3.0.csv":
      return "20230619";
    default:
      throw internal(`import.kit_apprentissage: unknown source file: ${source}`);
  }
}

function getRNCP(record: Record<string, unknown>): unknown {
  const value = record["CodeRNCP"] ?? record["Code RNCP"] ?? record["Fiche RNCP"] ?? record["FicheRNCP"];

  return typeof value === "string" || typeof value === "number" ? String(value).trim() : null;
}

function getCFD(record: Record<string, unknown>): unknown {
  const value = record["CodeDiplome"] ?? record["Code Diplome"] ?? record["Code Diplôme"];

  return typeof value === "string" || typeof value === "number" ? String(value).trim() : null;
}

export function buildKitApprentissageEntry(
  record: Record<string, unknown>
): AnyBulkWriteOperation<ISourceKitApprentissage> {
  const { _id, cfd, rncp } = zKitApprentissage.parse({
    _id: new ObjectId(),
    cfd: getCFD(record),
    rncp: getRNCP(record),
  });

  return {
    updateOne: {
      filter: { cfd, rncp },
      update: {
        $setOnInsert: { _id },
      },
      upsert: true,
    },
  };
}
