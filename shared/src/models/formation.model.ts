import { zFormation } from "api-alternance-sdk";
import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "./common.js";
import { zObjectId } from "./common.js";

const collectionName = "formation" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ "identifiant.cle_ministere_educatif": 1 }, { unique: true }],
  [{ "statut.catalogue": 1, "certification.valeur.domaines.rome.rncp.code": 1 }, {}],
  [{ "statut.catalogue": 1, "certification.valeur.identifiant.rncp": 1 }, {}],
  [{ "statut.catalogue": 1, "certification.valeur.intitule.niveau.rncp.europeen": 1 }, {}],
  [{ "statut.catalogue": 1, "certification.valeur.intitule.niveau.cfd.europeen": 1 }, {}],
  [{ "lieu.geolocalisation": "2dsphere", "statut.catalogue": 1 }, {}],
];

export const zFormationInternal = z.extend(zFormation, {
  _id: zObjectId,
  created_at: z.date(),
  updated_at: z.date(),
});

export type IFormationInternal = z.output<typeof zFormationInternal>;

export const formationModelDescriptor = {
  zod: zFormationInternal,
  indexes,
  collectionName,
};
