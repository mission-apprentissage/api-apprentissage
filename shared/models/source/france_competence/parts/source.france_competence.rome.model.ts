import { z } from "zod";

export const zSourceFcRome = z
  .object({
    Numero_Fiche: z.string(),
    Codes_Rome_Code: z.string().nullable(),
    Codes_Rome_Libelle: z.string().nullable(),
  })
  .strict();

export type ISourceFcRome = z.infer<typeof zSourceFcRome>;
