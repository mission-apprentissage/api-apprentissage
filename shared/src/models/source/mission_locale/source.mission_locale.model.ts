import { zMissionLocale } from "api-alternance-sdk";
import { z } from "zod";

import type { IModelDescriptorGeneric } from "../../common.js";
import { zObjectId } from "../../common.js";

const collectionName = "source.insee_to_ml" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [[{ code_insee: 1 }, { unique: true }]];

const zSourceCodeInseeToMissionLocale = z.object({
  _id: zObjectId,
  code_insee: z.string(),
  ml: zMissionLocale.nullable(),
  import_id: zObjectId,
});

export type ISourceCodeInseeToMissionLocale = z.output<typeof zSourceCodeInseeToMissionLocale>;

export const zSourceCodeInseeToMissionLocaleDescriptor = {
  zod: zSourceCodeInseeToMissionLocale,
  indexes,
  collectionName,
};
