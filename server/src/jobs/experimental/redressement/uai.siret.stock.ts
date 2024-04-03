import { uniqBy } from "lodash-es";

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
      // certification: "26X31021",
    },
    // {
    //   couple: {
    //     uai: "0942340H",
    //     siret: "84989709500014",
    //   },
    //   // certification: "36023201",
    // },
    // {
    //   couple: {
    //     uai: "9760229V",
    //     siret: "20000446300028",
    //   },
    // },
    // {
    //   couple: {
    //     uai: "0680008P",
    //     siret: "18671553800044",
    //   },
    // },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ].map((p: any) => ({
    uai_in: p.couple.uai,
    siret_in: p.couple.siret,
    ...(p.certification ? { certification_in: p.certification } : {}),
    updated: false,
  }));

  let countCurrentUpdates = -1;
  let finalStock = stock;
  while (countCurrentUpdates !== 0) {
    countCurrentUpdates = 0;
    const currentStock = [];
    for (const current of finalStock) {
      const r = await run({
        couple: {
          uai: current.uai_in,
          siret: current.siret_in,
        },
        certification: current.certification_in,
      });
      if (r.updated !== current.updated) countCurrentUpdates++;
      currentStock.push({
        ...r,
        updated: current.updated ? true : r.updated,
      });
    }
    finalStock = currentStock;
  }
  console.log(finalStock[0]);
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
      uai: {
        out: infoCouple.uai,
        nature_globale: infoCouple.ROR.nature,
        nature: infoCouple.RC.nature_uai_pour_cette_formation,
      },
      siret: {
        out: infoCouple.siret,
        nature_globale: infoCouple.ROR.nature,
        nature: infoCouple.RC.nature_siret_pour_cette_formation,
      },
      responsable: infoCouple.RC.responsable,
      formateur: infoCouple.RC.formateur,
      lieu: infoCouple.RC.lieu,
      _meta: {
        countFormations: 1,
        cle_ministere_educatif: infoCouple.RC.cle_ministere_educatif,
        cfd: infoCouple.RC.cfd,
        rncp: infoCouple.RC.rncp,
        deca: infoCouple.ROD,
      },
      updated: false,
      rules: infoCouple.rules,
    };
  }

  if (infoCouple.rules.includes("PC1") && infoCouple.rules.includes("ROR1") && infoCouple.rules.includes("RC5")) {
    const formationsUniq = formationsHasUniq(infoCouple.RC);

    const nature_siret = [];
    if (formationsUniq.responsable && formationsUniq.responsable.siret === infoCouple.siret) {
      nature_siret.push("responsable");
    }
    if (formationsUniq.formateur && formationsUniq.formateur.siret === infoCouple.siret) {
      nature_siret.push("formateur");
    }
    const nature_uai = [];
    if (formationsUniq.responsable && formationsUniq.responsable.uai === infoCouple.uai) {
      nature_uai.push("responsable");
    }
    if (formationsUniq.formateur && formationsUniq.formateur.uai === infoCouple.uai) {
      nature_uai.push("formateur");
    }

    return {
      uai_in: payload.couple.uai,
      siret_in: payload.couple.siret,
      certification_in: payload.certification ?? null,
      uai: {
        out: infoCouple.uai,
        nature_globale: infoCouple.ROR.nature,
        nature: nature_uai.join("_") || null,
      },
      siret: {
        out: infoCouple.siret,
        nature_globale: infoCouple.ROR.nature,
        nature: nature_siret.join("_") || null,
      },

      ...(formationsUniq.responsable ? { responsable: formationsUniq.responsable } : { responsable: null }),
      ...(formationsUniq.formateur ? { formateur: formationsUniq.formateur } : { formateur: null }),
      lieu: formationsUniq.lieu ?? null,

      _meta: {
        countFormations: infoCouple.RC.length,
        catalogue: infoCouple.RC,
        deca: infoCouple.ROD,
      },
      updated: false,
      rules: infoCouple.rules,
    };
  }

  if (
    infoCouple.rules.includes("PC1") &&
    (infoCouple.rules.includes("RLR1") || infoCouple.rules.includes("RLR5")) &&
    infoCouple.rules.includes("RC1")
  ) {
    const siret_out = { siret: null, nature_globale: null, nature: null };
    const orl = infoCouple.RLR.organismes[0]; // organisme_referentiel_rattache_au_lieu
    if (orl.siret === infoCouple.siret) {
      siret_out.siret = orl.siret;
      siret_out.nature_globale = orl.nature;
    }
    if (!siret_out.siret) {
      if (infoCouple.rules.includes("ROR1") || (infoCouple.rules.includes("ROR8") && infoCouple.ROR.length === 1)) {
        const ror = infoCouple.ROR.organismes[0]; // organisme_referentiel
        if (ror.siret === infoCouple.siret) {
          siret_out.siret = ror.siret;
          siret_out.nature_globale = ror.nature;
        }
      }
    }

    // if (!siret_out.siret) // TODO GET ANNUAIRE ENRTEPRISE INFO

    return {
      uai_in: payload.couple.uai,
      siret_in: payload.couple.siret,
      certification_in: payload.certification ?? null,
      uai: {
        out: infoCouple.uai,
        nature_globale: infoCouple.RLR.nature,
        nature: infoCouple.RC.nature_uai_pour_cette_formation,
      },
      siret: {
        ...siret_out,
        nature: infoCouple.RC.nature_siret_pour_cette_formation || null,
      },
      responsable: infoCouple.RC.responsable,
      formateur: infoCouple.RC.formateur,
      lieu: infoCouple.RC.lieu,
      _meta: {
        countFormations: 1,
        cle_ministere_educatif: infoCouple.RC.cle_ministere_educatif,
        cfd: infoCouple.RC.cfd,
        rncp: infoCouple.RC.rncp,
        deca: infoCouple.ROD,
      },
      updated: true,
      rules: infoCouple.rules,
    };
  }

  if (
    infoCouple.rules.includes("PC1") &&
    (infoCouple.rules.includes("RLR1") || infoCouple.rules.includes("RLR5")) &&
    infoCouple.rules.includes("RC5")
  ) {
    const siret_out = { siret: null, nature_globale: null, nature: null };
    const orl = infoCouple.RLR.organismes[0]; // organisme_referentiel_rattache_au_lieu
    if (orl.siret === infoCouple.siret) {
      siret_out.siret = orl.siret;
      siret_out.nature_globale = orl.nature;
    }
    if (!siret_out.siret) {
      if (infoCouple.rules.includes("ROR1") || (infoCouple.rules.includes("ROR8") && infoCouple.ROR.length === 1)) {
        const ror = infoCouple.ROR.organismes[0]; // organisme_referentiel
        if (ror.siret === infoCouple.siret) {
          siret_out.siret = ror.siret;
          siret_out.nature_globale = ror.nature;
        }
      }
    }

    const formationsUniq = formationsHasUniq(infoCouple.RC);

    const hasSingleNature = orl.nature === "formateur" || orl.nature === "responsable";
    if (hasSingleNature) {
      const oppositeOragnismeNature = orl.nature === "formateur" ? "responsable" : "formateur";
      const uniqOppositeOragnismeSiret = uniqBy(infoCouple.RC, `${oppositeOragnismeNature}.siret`);
      let oppositeOragnisme;
      if (uniqOppositeOragnismeSiret.length === 1) {
        // @ts-expect-error
        oppositeOragnisme = uniqOppositeOragnismeSiret[0][oppositeOragnismeNature];
      }

      return {
        uai_in: payload.couple.uai,
        siret_in: payload.couple.siret,
        certification_in: payload.certification ?? null,

        uai: {
          out: infoCouple.uai,
          nature_globale: infoCouple.RLR.nature,
          nature: infoCouple.RLR.nature,
        },
        siret: {
          // out: infoCouple.siret, // TODO
          out: null, // TODO Verifier les rules ORL pour sortir le siret sil est trouvé
          // nature_globale: infoCouple.ROR.nature, // TODO
          nature_globale: null, // TODO Verifier les rules ORL pour sortir la nature si elle existe
          nature: infoCouple.RC.nature_siret_pour_cette_formation || null,
        },

        ...(oppositeOragnisme ? { [oppositeOragnismeNature]: oppositeOragnisme } : { [oppositeOragnismeNature]: null }),
        [orl.nature]: orl,
        lieu: formationsUniq.lieu,

        _meta: {
          countFormations: infoCouple.RC.length,
          ...(!oppositeOragnisme ? { catalogue: infoCouple.RC } : {}),
          deca: infoCouple.ROD,
        },
        updated: true,
        rules: infoCouple.rules,
      };
    }

    const nature_siret = [];
    if (formationsUniq.responsable && formationsUniq.responsable.siret === infoCouple.siret) {
      nature_siret.push("responsable");
    }
    if (formationsUniq.formateur && formationsUniq.formateur.siret === infoCouple.siret) {
      nature_siret.push("formateur");
    }
    const nature_uai = [];
    if (formationsUniq.responsable && formationsUniq.responsable.uai === infoCouple.uai) {
      nature_uai.push("responsable");
    }
    if (formationsUniq.formateur && formationsUniq.formateur.uai === infoCouple.uai) {
      nature_uai.push("formateur");
    }

    return {
      uai_in: payload.couple.uai,
      siret_in: payload.couple.siret,
      certification_in: payload.certification ?? null,

      uai: {
        out: infoCouple.uai,
        nature_globale: infoCouple.RLR.nature,
        nature: nature_uai.join("_") || null,
      },
      siret: {
        ...siret_out,
        nature: nature_siret.join("_") || null,
      },
      ...(formationsUniq.responsable ? { responsable: formationsUniq.responsable } : { responsable: null }),
      ...(formationsUniq.formateur ? { formateur: formationsUniq.formateur } : { formateur: null }),
      lieu: formationsUniq.lieu ?? infoCouple.RLR.lieux_de_formation,

      _meta: {
        countFormations: infoCouple.RC.length,
        catalogue: infoCouple.RC,
        deca: infoCouple.ROD,
      },
      updated: true,
      rules: infoCouple.rules,
    };
  }

  return {
    uai_in: payload.couple.uai,
    siret_in: payload.couple.siret,
    certification_in: payload.certification ?? null,

    uai: null,
    siret: null,

    responsable: null,
    formateur: null,
    lieu: null,
    _meta: {},
    updated: true,
    rules: infoCouple.rules,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function formationsHasUniq(formationsCatalogue: any): {
  responsable: {
    siret: string;
    uai: string;
  } | null;
  formateur: {
    siret: string;
    uai: string;
  } | null;
  lieu: {
    siret: string;
    uai: string;
  } | null;
} {
  const result = {
    responsable: null,
    formateur: null,
    lieu: null,
  };
  const uniqResponsableSiret = uniqBy(formationsCatalogue, "responsable.siret");
  const uniqFormateurSiret = uniqBy(formationsCatalogue, "formateur.siret");
  let uniqLieuUai = uniqBy(formationsCatalogue, "lieu.uai");
  if (uniqResponsableSiret.length === 1) {
    // @ts-expect-error
    result.responsable = uniqResponsableSiret[0].responsable;
  }
  if (uniqFormateurSiret.length === 1) {
    // @ts-expect-error
    result.formateur = uniqFormateurSiret[0].formateur;
  }
  if (uniqLieuUai.length === 1) {
    // @ts-expect-error
    result.lieu = uniqFormateurSiret[0].lieu;
  } else {
    uniqLieuUai = uniqBy(formationsCatalogue, "lieu.geo_coordonnees");
    if (uniqLieuUai.length === 1) {
      // @ts-expect-error
      result.lieu = uniqFormateurSiret[0].lieu;
    }
  }
  return result;
}
