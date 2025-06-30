import { internal } from "@hapi/boom";
import type { IFormation } from "api-alternance-sdk";
import type { IFormationCatalogue } from "shared/models/source/catalogue/source.catalogue.model";
import { z } from "zod/v4-mini";

export function buildFormationModalite(
  data: Pick<IFormationCatalogue, "duree" | "entierement_a_distance" | "annee" | "bcn_mefs_10">
): IFormation["modalite"] {
  const duree = z.safeParse(z.coerce.number().check(z.positive(), z.int()), data.duree);

  if (!duree.success) {
    throw internal(`buildModalite: invalid duree`, { duree: data.duree });
  }

  if (data.annee === "X") {
    return {
      entierement_a_distance: data.entierement_a_distance,
      duree_indicative: duree.data,
      annee_cycle: null,
      mef_10: data.bcn_mefs_10.length === 1 ? data.bcn_mefs_10[0].mef10 : null,
    };
  }

  const annee = z.safeParse(z.coerce.number().check(z.positive(), z.int()), data.annee);
  if (!annee.success) {
    throw internal(`buildModalite: invalid annee`, { annee: data.annee });
  }

  return {
    entierement_a_distance: data.entierement_a_distance,
    duree_indicative: duree.data,
    annee_cycle: annee.data,
    mef_10: data.bcn_mefs_10.length === 1 ? data.bcn_mefs_10[0].mef10 : null,
  };
}
