import { z } from "zod/v4-mini";

export const zSourceFcCcn = z.object({
  Numero_Fiche: z.string(),
  Ccn_1_Numero: z.nullable(z.string()),
  Ccn_1_Libelle: z.nullable(z.string()),
  Ccn_2_Numero: z.nullable(z.string()),
  Ccn_2_Libelle: z.nullable(z.string()),
  Ccn_3_Numero: z.nullable(z.string()),
  Ccn_3_Libelle: z.nullable(z.string()),
});

export type ISourceFcCcn = z.output<typeof zSourceFcCcn>;
