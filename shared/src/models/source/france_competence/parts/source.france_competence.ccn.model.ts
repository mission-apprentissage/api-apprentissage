import { z } from "zod";

export const zSourceFcCcn = z
  .object({
    Numero_Fiche: z.string(),
    Ccn_1_Numero: z.string().nullable(),
    Ccn_1_Libelle: z.string().nullable(),
    Ccn_2_Numero: z.string().nullable(),
    Ccn_2_Libelle: z.string().nullable(),
    Ccn_3_Numero: z.string().nullable(),
    Ccn_3_Libelle: z.string().nullable(),
  })
  .strict();

export type ISourceFcCcn = z.output<typeof zSourceFcCcn>;
