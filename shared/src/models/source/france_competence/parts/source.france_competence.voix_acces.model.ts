import type { z } from "zod/v4-mini"
import { nullable, object, string } from "zod/v4-mini"

export const zSourceFcVoixAcces = object({
  Numero_Fiche: string(),
  Si_Jury: nullable(string()),
})

export type ISourceFcVoixAcces = z.infer<typeof zSourceFcVoixAcces>
