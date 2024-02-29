import { z } from "zod";

export const zSourceFcFormacode = z
  .object({
    Numero_Fiche: z.string(),
    Formacode_Code: z.string().nullable(),
    Formacode_Libelle: z.string().nullable(),
  })
  .strict();

export type ISourceFcFormacode = z.infer<typeof zSourceFcFormacode>;
