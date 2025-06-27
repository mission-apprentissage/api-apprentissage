import { z } from "zod/v4-mini";

export const zSourceFcRome = z.object({
  Numero_Fiche: z.string(),
  Codes_Rome_Code: z.string(),
  Codes_Rome_Libelle: z.string(),
});

export type ISourceFcRome = z.infer<typeof zSourceFcRome>;
