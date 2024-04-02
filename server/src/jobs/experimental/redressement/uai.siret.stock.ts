import parentLogger from "@/services/logger";

import { ArgsPayload, runExperiementalRedressementUaiSiret } from "./uai.siret";

const logger = parentLogger.child({ module: "experimental:redressement:uai-siret-stock" });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runExperiementalRedressementUaiSiretStock(): Promise<any> {
  logger.info("Starting");

  // couple: {
  //   uai: "0333636Y",
  //   siret: "89368204700038",
  // },
  // certification: "26X31021",
  const stock = [
    {
      couple: {
        uai: "0942340H",
        siret: "84989709500014",
      },
      // certification: "36023201",
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ].map((p: any) => ({
    uai_in: p.couple.uai,
    siret_in: p.couple.siret,
    ...(p.certification ? { certification_in: p.certification } : {}),
    updated: false,
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
      if (r.updated !== current.updated) countUpdates++;
      currentStock.push({
        ...r,
        updated: current.updated ? true : r.updated,
      });
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
      certification_in: payload.certification ?? null,
      uai_out: infoCouple.uai,
      siret_out: infoCouple.siret,
      nature_globale: infoCouple.ROR.nature,
      nature_pour_cette_formation: infoCouple.RC.nature_pour_cette_formation,
      _meta: {
        cle_ministere_educatif: infoCouple.RC.cle_ministere_educatif,
        cfd: infoCouple.RC.cfd,
        rncp: infoCouple.RC.rncp,
        responsable: infoCouple.RC.responsable,
        formateur: infoCouple.RC.formateur,
        lieu: infoCouple.RC.lieu,
      },
      updated: false,
      rules: infoCouple.rules,
    };
  }

  if (infoCouple.rules.includes("PC1") && infoCouple.rules.includes("RLR1") && infoCouple.rules.includes("RC1")) {
    return {
      uai_in: payload.couple.uai,
      siret_in: payload.couple.siret,
      certification_in: payload.certification ?? null,
      uai_out: infoCouple.uai,
      siret_out: infoCouple.RC.lieu.siret,
      nature_globale: infoCouple.RLR.nature,
      nature_pour_cette_formation: infoCouple.RC.nature_pour_cette_formation,
      _meta: {
        cle_ministere_educatif: infoCouple.RC.cle_ministere_educatif,
        cfd: infoCouple.RC.cfd,
        rncp: infoCouple.RC.rncp,
        responsable: infoCouple.RC.responsable,
        formateur: infoCouple.RC.formateur,
        lieu: infoCouple.RC.lieu,
      },
      updated: true,
      rules: infoCouple.rules,
    };
  }

  if (infoCouple.rules.includes("PC1") && infoCouple.rules.includes("RLR1") && infoCouple.rules.includes("RC5")) {
    const organisme_referentiel = infoCouple.RLR.organismes[0];

    const lookForEqualKey =
      organisme_referentiel.nature === "formateur"
        ? "responsable"
        : organisme_referentiel.nature === "responsable"
          ? "formateur"
          : null;
    if (lookForEqualKey) {
      let lookup = { siret: null };
      for (const formation of infoCouple.RC) {
        if (lookup.siret !== formation[lookForEqualKey].siret) lookup = formation[lookForEqualKey];
      }
      const formation = infoCouple.RC[0];
      if (lookup.siret === formation[lookForEqualKey].siret) {
        return {
          uai_in: payload.couple.uai,
          siret_in: payload.couple.siret,
          certification_in: payload.certification ?? null,
          uai_out: infoCouple.uai,
          siret_out: formation.lieu.siret,
          nature_globale: infoCouple.RLR.nature,
          nature_pour_cette_formation: null,
          _meta: {
            catalogue: infoCouple.RC,
            [lookForEqualKey]: lookup,
            [lookForEqualKey === "formateur" ? "responsable" : "formateur"]: organisme_referentiel,
            lieu: formation.lieu,
          },
          updated: true,
          rules: infoCouple.rules,
        };
      }
    }

    return {
      uai_in: payload.couple.uai,
      siret_in: payload.couple.siret,
      certification_in: payload.certification ?? null,
      uai_out: infoCouple.uai,
      siret_out: null,
      nature_globale: infoCouple.RLR.nature,
      nature_pour_cette_formation: null,
      _meta: {
        organisme_referentiel,
        catalogue: infoCouple.RC,
        lieu: infoCouple.RLR.lieux_de_formation,
      },
      updated: true,
      rules: infoCouple.rules,
    };
  }

  return {
    updated: true,
    rules: infoCouple.rules,
  };
}
