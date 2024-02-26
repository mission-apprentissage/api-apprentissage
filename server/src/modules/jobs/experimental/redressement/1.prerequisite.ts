import { ISourceAcceUai } from "shared/models/source/acce/source.acce.model";

import { findDataFromSiret } from "../../../../common/apis/entreprise/tmp/infoSiret.actions";
import { getDbCollection } from "../../../../common/utils/mongodbUtils";

type PrerequisiteUaiResult = {
  uai: string;
  uai_ouvert: boolean;
  uai_etat: "Ouvert" | "Fermé";
  uai_date_ouverture: string;
  uai_date_fermeture: string;
};

type PrerequisiteSiretResult = {
  siret: string;
  siret_ouvert: boolean;
  siret_etat: "Ouvert" | "Fermé";
  siret_date_ouverture: string;
  siret_date_fermeture: string;
};

export interface PrerequisiteResult extends PrerequisiteUaiResult, PrerequisiteSiretResult {
  rules: ("PC1" | "PC2" | "PC3" | "PC4")[];
}

export async function prerequisite_uai(
  uai: string | undefined | null,
  _options?: { date: Date | undefined }
): Promise<PrerequisiteUaiResult> {
  // TODO verif shape/format
  if (!uai) throw new Error("L'UAI fourni n'est pas au bon format");

  const dbResult = await getDbCollection("source.acce")
    .find<ISourceAcceUai>({
      source: "ACCE_UAI.csv",
      "data.numero_uai": uai,
    })
    .toArray();

  if (!dbResult.length) throw new Error("L'UAI fourni n'est pas retrouvé dans ACCE");
  if (dbResult.length > 1) throw new Error("L'UAI fourni est retrouvé plusieurs fois dans ACCE");

  const [acceResult] = dbResult;

  const isOpen = acceResult.data.etat_etablissement === "1";

  return {
    uai,
    uai_ouvert: isOpen,
    uai_etat: isOpen ? "Ouvert" : "Fermé",
    uai_date_ouverture: acceResult.data.date_ouverture,
    uai_date_fermeture: acceResult.data.date_fermeture ?? "",
  };
}

export async function prerequisite_siret(
  siret: string | undefined | null,
  _options?: { date: Date | undefined }
): Promise<PrerequisiteSiretResult | null> {
  // TODO verif shape/format
  if (!siret) throw new Error("Le siret fourni n'est pas au bon format");

  const siretData = await findDataFromSiret(siret);

  // TODO handle Null
  if (!siretData.result) throw new Error(siretData.error.message);
  // if (siretData.error.secret_siret) return null;

  return {
    siret,
    siret_ouvert: !siretData.result.ferme,
    siret_etat: siretData.result.ferme ? "Fermé" : "Ouvert",
    siret_date_ouverture: "",
    siret_date_fermeture: siretData.result.date_fermeture ?? "",
  };
}
