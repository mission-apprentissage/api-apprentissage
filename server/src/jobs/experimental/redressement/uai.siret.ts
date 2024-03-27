import parentLogger from "@/services/logger";

import { prerequisite_siret, prerequisite_uai, PrerequisiteResult } from "./1.prerequisite";
import { rechercheCatalogue, rechercheLieuxReferentiel, rechercheOrganismesReferentiel } from "./2.unitaire";

const logger = parentLogger.child({ module: "experimental:redressement:uai-siret" });

export interface ICouple {
  uai: string | undefined | null;
  siret: string | undefined | null;
}

interface ArgsPayload {
  couple: ICouple;
  date?: Date;
  certification?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runExperiementalRedressementUaiSiret(arg: ArgsPayload): Promise<any> {
  const result = await run({ ...arg });
  console.log(result);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function run({ couple, date, certification }: ArgsPayload): Promise<any> {
  logger.info("Provided", couple, certification);
  if (!couple.siret && !couple.uai) {
    throw new Error("L'UAI et le Siret ne sont pas définis");
  }

  const prerequisiteUai = couple.uai ? await prerequisite_uai(couple.uai, { date }) : null;

  const prerequisiteSiret = couple.siret ? await prerequisite_siret(couple.siret, { date }) : null;

  if (!couple.siret && couple.uai && prerequisiteUai) {
    // Only uai provided
    const { rule: u2rule, ...restu2 } = await rechercheLieuxReferentiel(couple.uai);
    return {
      ...prerequisiteUai,
      [u2rule]: restu2,
      rules: [u2rule],
    };
  } else if (couple.siret && !couple.uai && prerequisiteSiret) {
    // Only siret provided
    return {
      ...prerequisiteSiret,
    };
  }

  if (!prerequisiteUai || !prerequisiteSiret) throw new Error("Did not except");

  let resultRule = "";
  if (prerequisiteUai.uai_ouvert && prerequisiteSiret.siret_ouvert) resultRule = "PC1";
  else if (prerequisiteUai.uai_ouvert && !prerequisiteSiret.siret_ouvert) resultRule = "PC2";
  else if (!prerequisiteUai.uai_ouvert && prerequisiteSiret.siret_ouvert) resultRule = "PC3";
  else if (!prerequisiteUai.uai_ouvert && !prerequisiteSiret.siret_ouvert) resultRule = "PC4";

  const resultPrerequisite = {
    ...prerequisiteUai,
    ...prerequisiteSiret,
    rules: [resultRule as "PC1" | "PC2" | "PC3" | "PC4"],
  };

  /////////////////////////////////////////////////////
  let resultUnitaire = resultPrerequisite;
  const { rule: u1rule, ...restu1 } = await rechercheOrganismesReferentiel(resultPrerequisite as PrerequisiteResult);
  resultUnitaire = {
    ...resultUnitaire,
    ...(u1rule !== "ROR9" ? { ROR: restu1 } : { ROR: null }),
    rules: [...resultUnitaire.rules, u1rule],
  };

  const { rule: u2rule, ...restu2 } = await rechercheLieuxReferentiel(resultPrerequisite.uai);
  resultUnitaire = {
    ...resultUnitaire,
    ...(u2rule !== "RLR3" ? { RLR: restu2 } : { RLR: null }),
    rules: [...resultUnitaire.rules, u2rule],
  };

  const { rule: cataloguerule, result } = await rechercheCatalogue(resultPrerequisite as PrerequisiteResult, {
    date,
    certification,
  });
  resultUnitaire = {
    ...resultUnitaire,
    ...(cataloguerule !== "RC3" ? { RC: result } : {}),
    rules: [...resultUnitaire.rules, cataloguerule],
  };

  return resultUnitaire;
}
