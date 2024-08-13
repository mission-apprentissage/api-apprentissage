import { z } from "zod";

export const zSourceFcFormacode = z
  .object({
    Numero_Fiche: z.string(),
    Formacode_Code: z.string(),
    Formacode_Libelle: z.string(),
  })
  .strict();

export type ISourceFcFormacode = z.infer<typeof zSourceFcFormacode>;
