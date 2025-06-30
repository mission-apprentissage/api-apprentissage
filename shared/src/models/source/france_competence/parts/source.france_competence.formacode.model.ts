import { z } from "zod/v4-mini";

export const zSourceFcFormacode = z.object({
  Numero_Fiche: z.string(),
  Formacode_Code: z.string(),
  Formacode_Libelle: z.string(),
});

export type ISourceFcFormacode = z.infer<typeof zSourceFcFormacode>;
