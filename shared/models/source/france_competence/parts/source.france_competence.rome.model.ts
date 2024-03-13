import { z } from "zod";

export const zSourceFcRome = z
  .object({
    Numero_Fiche: z.string(),
    Codes_Rome_Code: z.string(),
    Codes_Rome_Libelle: z.string(),
  })
  .strict();

export type ISourceFcRome = z.infer<typeof zSourceFcRome>;
