import { z } from "zod";

export const zSourceFcVoixAcces = z
  .object({
    Numero_Fiche: z.string(),
    Si_Jury: z.string().nullable(),
  })
  .strict();

export type ISourceFcVoixAcces = z.infer<typeof zSourceFcVoixAcces>;
