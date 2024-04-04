import parentLogger from "@/services/logger";

import { prerequisite_siret, prerequisite_uai, PrerequisiteResult } from "./1.prerequisite";
import {
  rechercheCatalogue,
  rechercheLieuxReferentiel,
  rechercheOrganismeDECA,
  rechercheOrganismesReferentiel,
} from "./2.recherche";

const logger = parentLogger.child({ module: "experimental:redressement:uai-siret" });

export interface ICouple {
  uai?: string | undefined | null;
  siret?: string | undefined | null;
}

export interface ArgsPayload {
  couple: ICouple;
  date?: Date;
  certification?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runExperiementalRedressementUaiSiret(arg: ArgsPayload): Promise<any> {
  const result = await run({ ...arg });
  return result;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function run({ couple, date, certification }: ArgsPayload): Promise<any> {
  logger.info(`Provided ${JSON.stringify({ couple, certification })}`);
  if (!couple.siret && !couple.uai) {
    throw new Error("L'UAI et le Siret ne sont pas définis");
  }

  const prerequisiteUai = couple.uai ? await prerequisite_uai(couple.uai, { date }) : null;

  const prerequisiteSiret = couple.siret ? await prerequisite_siret(couple.siret, { date }) : null;

  if (!couple.siret && couple.uai && prerequisiteUai) {
    // TODO ADD ROR single search
    // Only uai provided
    const { rule: u2rule, ...restu2 } = await rechercheLieuxReferentiel(couple.uai);
    return {
      ...prerequisiteUai,
      ...(u2rule !== "RLR3" ? { RLR: restu2 } : { RLR: null }),
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
  const { rule: rorRule, ...restu1 } = await rechercheOrganismesReferentiel(resultPrerequisite as PrerequisiteResult);
  resultUnitaire = {
    ...resultUnitaire,
    ...(rorRule !== "ROR9" ? { ROR: restu1 } : { ROR: null }),
    rules: [...resultUnitaire.rules, rorRule],
  };

  let rlrRule = "";
  // if (rorRule !== "ROR1") {
  const { rule: rlrRuleT, ...restu2 } = await rechercheLieuxReferentiel(resultPrerequisite.uai);
  rlrRule = rlrRuleT;
  resultUnitaire = {
    ...resultUnitaire,
    ...(rlrRuleT !== "RLR3" ? { RLR: restu2 } : { RLR: null }),
    rules: [...resultUnitaire.rules, rlrRuleT],
  };
  // }

  const { rule: cataloguerule, result } = await rechercheCatalogue(resultPrerequisite as PrerequisiteResult, {
    date,
    certification,
    rlrRule,
  });
  resultUnitaire = {
    ...resultUnitaire,
    ...(cataloguerule !== "RC3" && cataloguerule !== "RC4" ? { RC: result } : { RC: null }),
    rules: [...resultUnitaire.rules, cataloguerule],
  };

  try {
    const { rule: decarule, result: resultDeca } = await rechercheOrganismeDECA(
      resultPrerequisite as PrerequisiteResult,
      {
        date,
        certification,
      }
    );

    resultUnitaire = {
      ...resultUnitaire,
      ...(decarule !== "ROD3" ? { ROD: resultDeca } : { ROD: null }),
      rules: [...resultUnitaire.rules, decarule],
    };
  } catch (error) {
    resultUnitaire = {
      ...resultUnitaire,
      // @ts-ignore
      ROD: null,
      rules: [...resultUnitaire.rules],
    };
  }

  return resultUnitaire;
}
