import { internal } from "@hapi/boom";
import { ObjectId } from "mongodb";
import {
  ISourceKitApprentissage,
  zKitApprentissage,
} from "shared/models/source/kitApprentissage/source.kit_apprentissage.model";

export function normalizeKitApprentissageColumnName(column: string): string {
  switch (column) {
    // v1.0+: CodeDiplome
    // v1.3+: Code Diplome
    // v1.8+: Code Diplôme
    case "CodeDiplome":
    case "Code Diplome":
    case "Code Diplôme":
      return "Code Diplôme";
    // v1.0+: Intitulé Diplôme
    // v1.3+: Intitulé certification
    // v2.0+: Intitulé diplôme (DEPP)
    case "Intitulé Diplôme":
    case "Intitulé certification":
    case "Intitulé diplôme (DEPP)":
      return "Intitulé diplôme (DEPP)";
    case "CodeRNCP":
    case "Code RNCP":
    case "Fiche RNCP":
    case "FicheRNCP":
      return "FicheRNCP";
    // v1.0+: Niveau2019
    // v1.3+: Niveau de formation
    // v2.0+: Niveau fiche RNCP
    case "Niveau2019":
    case "Niveau de formation":
    case "Niveau fiche RNCP":
      return "Niveau fiche RNCP";
    // v1.0+: type Diplôme
    // v2.0+: Abrégé de diplôme (RNCP)
    case "type Diplôme":
    case "Abrégé de diplôme (RNCP)":
      return "Abrégé de diplôme (RNCP)";
    // v1.0+: n/a
    // v1.1+: DerniereMaJ
    // v1.3+: Derniere MaJ
    // v1.8+: Dernière MaJ
    case "DerniereMaJ":
    case "Derniere MaJ":
    case "Dernière MaJ":
      return "Dernière MaJ";
    // v1.0+: n/a
    // v2.0+: Accès à l'apprentissage de la fiche RNCP (oui/non)
    case "Accès à l'apprentissage de la fiche RNCP (oui/non)":
      return "Accès à l'apprentissage de la fiche RNCP (oui/non)";
    // v1.0+: n/a
    // v2.0+: Date d'échéance de la fiche RNCP
    case "Date d'échéance de la fiche RNCP":
      return "Date d'échéance de la fiche RNCP";
    // v1.0+: n/a
    // v1.4+: Fiche RNCP active/inactive
    // v2.0+: Fiche ACTIVE/INACTIVE
    case "Fiche RNCP active/inactive":
    case "Fiche ACTIVE/INACTIVE":
      return "Fiche ACTIVE/INACTIVE";
    // v1.0+: n/a
    // v20240223+: Intitulé certification (RNCP)
    case "Intitulé certification (RNCP)":
      return "Intitulé certification (RNCP)";
    // v1.0+: n/a
    // V20240223+: Type d'enregistrement
    case "Type d'enregistrement":
      return "Type d'enregistrement";
    // v1.0+: n/a
    // v20240223+: Date de publication de la fiche\n (enregistrement de droit)
    case "Date de publication de la fiche\n (enregistrement de droit)":
      return "Date de publication de la fiche";
    // v1.0+: n/a
    // v20240223+: Date de décision\n (enregistrement sur demande)
    case "Date de décision\n (enregistrement sur demande)":
      return "Date de décision";
    // v1.0+: n/a
    // v20240223+: "Date de début des parcours certifiants\n\n(enregistrement de droit)"
    case "Date de début des parcours certifiants\n\n(enregistrement de droit)":
      return "Date de début des parcours certifiants";
    // v1.0+: n/a
    // v20240223+: Date limite de la délivrance
    case "Date limite de la délivrance":
      return "Date limite de la délivrance";
    // v1.0+: n/a
    // v20240223+: Nouvelle Certification rempla (RNCP)
    case "Nouvelle Certification rempla (RNCP)":
      return "Nouvelle Certification rempla (RNCP)";
    // v1.0+: n/a
    // v20240223+: Ancienne Certification (RNCP)
    case "Ancienne Certification (RNCP)":
      return "Ancienne Certification (RNCP)";
    default:
      throw internal(`import.kit_apprentissage: unknown column name: ${column}`);
  }
}

function assertUnreacheableVersion(version: string): never {
  throw internal(`import.kit_apprentissage: unexpected version ${version}`);
}

function correctionErreursDeSaisie(
  source: ISourceKitApprentissage["source"],
  version: ISourceKitApprentissage["version"],
  data: Record<string, string | null>
): Record<string, string | null> {
  if (data["Code Diplôme"] === "SQWQ") {
    switch (source) {
      case "Kit apprentissage et RNCP v2.3.csv":
      case "Kit apprentissage et RNCP v2.4.csv":
      case "Kit apprentissage et RNCP v2.5.csv":
        data["Code Diplôme"] = "NR";
        break;
      default:
        throw internal(`import.kit_apprentissage: SQWQ value in unexpected file ${source}`);
    }
  }

  switch (data["FicheRNCP"]) {
    case "RNCP12803?":
      data["FicheRNCP"] =
        version >= "20200414" && version <= "20201116" ? "RNCP12803" : assertUnreacheableVersion(version);
      break;
    case "RNCP187485":
    case "RNCP24544":
      data["FicheRNCP"] = version >= "20200414" && version <= "20201116" ? "NR" : assertUnreacheableVersion(version);
      break;
    case "RNCP28378":
      data["FicheRNCP"] =
        version >= "20200414" && version <= "20201116" ? "RNCP29378" : assertUnreacheableVersion(version);
      break;
    case "RNCP29839":
      data["FicheRNCP"] =
        version >= "20200414" && version <= "20201116" ? "RNCP26839" : assertUnreacheableVersion(version);
      break;
    case "RNCP30348":
      data["FicheRNCP"] = version >= "20200525" && version <= "20200525" ? "NR" : assertUnreacheableVersion(version);
      break;
    case "RNCP30387?":
      data["FicheRNCP"] =
        version >= "20200414" && version <= "20200414" ? "RNCP30387" : assertUnreacheableVersion(version);
      break;
    case "RNCP35136":
      data["FicheRNCP"] =
        version >= "20201218" && version <= "20201218" ? "RNCP35135" : assertUnreacheableVersion(version);
      break;
    case "RNCP35418":
      data["FicheRNCP"] =
        version >= "20210330" && version <= "20210330" ? "RNCP35417" : assertUnreacheableVersion(version);
      break;
    case "RNCP35434":
      data["FicheRNCP"] =
        version >= "20210330" && version <= "20210330" ? "RNCP35433" : assertUnreacheableVersion(version);
      break;
    case "RNCP432":
      data["FicheRNCP"] =
        version >= "20200414" && version <= "20200414" ? "RNCP34432" : assertUnreacheableVersion(version);
      break;
    case "RNCP813":
      data["FicheRNCP"] =
        version >= "20200414" && version <= "20201116" ? "RNCP1813" : assertUnreacheableVersion(version);
      break;
    default:
    // no-op
  }

  return data;
}

export function getVersionNumber(source: string): string {
  const matchVersion = /^Kit_apprentissage_(\d{8})\.csv$/.exec(source);
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

export function buildKitApprentissageEntry(
  columns: ReadonlyArray<{ name: string }>,
  record: Record<string, string>,
  source: string,
  importDate: Date,
  version: string
): ISourceKitApprentissage {
  const data = columns.reduce(
    (acc: Record<string, string | null>, column: { name: string }) => {
      // Replace all mongodb dot special character with underscore
      acc[normalizeKitApprentissageColumnName(column.name)] = record[column.name]?.trim() || null;
      return acc;
    },
    {
      "Dernière MaJ": "v1.0",
      "Accès à l'apprentissage de la fiche RNCP (oui/non)": null,
      "Date d'échéance de la fiche RNCP": null,
      "Fiche ACTIVE/INACTIVE": null,
      "Intitulé certification (RNCP)": null,
      "Type d'enregistrement": null,
      "Date de publication de la fiche": null,
      "Date de décision": null,
      "Date de début des parcours certifiants": null,
      "Date limite de la délivrance": null,
      "Nouvelle Certification rempla (RNCP)": null,
      "Ancienne Certification (RNCP)": null,
    }
  );

  return zKitApprentissage.parse({
    _id: new ObjectId(),
    source,
    date: importDate,
    data: correctionErreursDeSaisie(source, version, data),
    version,
  });
}
