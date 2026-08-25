import { z } from "zod/v4-mini"

import type { IModelDescriptorGeneric } from "../common.js"
import { zObjectIdMini } from "../common.js"
import { zApiKeyEnv } from "../user.model.js"

const collectionName = "indicateurs.usage_api" as const

const indexes: IModelDescriptorGeneric["indexes"] = [[{ method: 1, path: 1, date: 1, user_id: 1, api_key_id: 1, code: 1 }, { unique: true }]]

export const zIndicateurUsageApi = z.object({
  _id: zObjectIdMini,
  method: z.string(),
  path: z.string(),
  date: z.date(),
  user_id: zObjectIdMini,
  api_key_id: zObjectIdMini,
  // Optionnel : les documents antérieurs à l'introduction du champ n'en ont pas (équivalent production)
  api_key_env: z.optional(zApiKeyEnv),
  code: z.number(),
  type: z.enum(["informational", "success", "redirection", "client_error", "server_error", "unknown"]),
  count: z.number(),
})

export type IIndicateurUsageApi = z.output<typeof zIndicateurUsageApi>

export const indicateurUsageApiModelDescriptor = {
  zod: zIndicateurUsageApi,
  indexes,
  collectionName,
}
