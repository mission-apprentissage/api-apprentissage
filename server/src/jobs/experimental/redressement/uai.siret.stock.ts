import parentLogger from "@/services/logger";

import { ArgsPayload, runExperiementalRedressementUaiSiret } from "./uai.siret";

const logger = parentLogger.child({ module: "experimental:redressement:uai-siret-stock" });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runExperiementalRedressementUaiSiretStock(): Promise<any> {
  logger.info("Starting");

  const stock = [
    {
      couple: {
        uai: "0333636Y",
        siret: "89368204700038",
      },
      certification: "26X31021",
    },
  ].map((p) => ({
    uai_in: p.couple.uai,
    siret_in: p.couple.siret,
    certification_in: p.certification,
  }));

  let countUpdates = -1;
  let finalStock = stock;
  while (countUpdates !== 0) {
    countUpdates = 0;
    const currentStock = [];
    for (const current of finalStock) {
      const r = await run({
        couple: {
          uai: current.uai_in,
          siret: current.siret_in,
        },
        certification: current.certification_in,
      });
      if (r.updated) countUpdates++;
      currentStock.push(r); // TODO updated keep original
    }
    finalStock = currentStock;
  }
  console.log(finalStock);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function run(payload: ArgsPayload): Promise<any> {
  const infoCouple = await runExperiementalRedressementUaiSiret(payload);
  // console.log(infoCouple);
  if (infoCouple.rules.includes("PC1") && infoCouple.rules.includes("ROR1") && infoCouple.rules.includes("RC1")) {
    return {
      uai_in: payload.couple.uai,
      siret_in: payload.couple.siret,
      certification_in: payload.certification,
      uai_out: infoCouple.uai,
      siret_out: infoCouple.siret,
      _meta: {
        nature_globale: infoCouple.ROR.nature,
        nature_pour_cette_formation: infoCouple.RC.nature_pour_cette_formation,
        cle_ministere_educatif: infoCouple.RC.cle_ministere_educatif,
        cfd: infoCouple.RC.cfd,
        rncp: infoCouple.RC.rncp,
        responsable: infoCouple.RC.responsable,
        formateur: infoCouple.RC.formateur,
        lieu: infoCouple.RC.lieu,
      },
      updated: false,
    };
  }

  return {
    updated: true,
  };
}
