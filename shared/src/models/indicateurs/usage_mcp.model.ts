import { z } from "zod/v4-mini"

import type { IModelDescriptorGeneric } from "../common.js"
import { zObjectIdMini } from "../common.js"

const collectionName = "indicateurs.usage_mcp" as const

const indexes: IModelDescriptorGeneric["indexes"] = [[{ date: 1, user_id: 1, api_key_id: 1, tool: 1, client: 1, status: 1 }, { unique: true }]]

export const zIndicateurUsageMcpStatus = z.enum(["success", "tool_error", "server_error"])

export const zIndicateurUsageMcp = z.object({
  _id: zObjectIdMini,
  date: z.date(),
  user_id: zObjectIdMini,
  api_key_id: zObjectIdMini,
  // Nom d'un outil déclaré, ou « outil_inconnu »
  tool: z.string(),
  // Produit du User-Agent, cf. resolveClientName : valeur choisie par l'appelant
  client: z.string(),
  status: zIndicateurUsageMcpStatus,
  count: z.number(),
})

export type IIndicateurUsageMcp = z.output<typeof zIndicateurUsageMcp>
export type IIndicateurUsageMcpStatus = z.output<typeof zIndicateurUsageMcpStatus>

export const indicateurUsageMcpModelDescriptor = {
  zod: zIndicateurUsageMcp,
  indexes,
  collectionName,
}
