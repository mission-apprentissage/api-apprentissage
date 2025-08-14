import { zMissionLocale } from "api-alternance-sdk";
import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "../../common.js";
import { zObjectIdMini } from "../../common.js";

const collectionName = "source.insee_to_ml" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [[{ code_insee: 1 }, { unique: true }]];

const zSourceCodeInseeToMissionLocale = z.object({
  _id: zObjectIdMini,
  code_insee: z.string(),
  ml: z.nullable(zMissionLocale),
  import_id: zObjectIdMini,
});

export type ISourceCodeInseeToMissionLocale = z.output<typeof zSourceCodeInseeToMissionLocale>;

export const zSourceCodeInseeToMissionLocaleDescriptor = {
  zod: zSourceCodeInseeToMissionLocale,
  indexes,
  collectionName,
};
