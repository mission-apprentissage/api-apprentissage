import { z } from "zod";

import { zodOpenApi } from "../../openapi/utils/zodWithOpenApi.js";

export const zDepartement = zodOpenApi
  .object({
    nom: z.string(),
    codeInsee: z.string(),
    region: z.object({
      codeInsee: z.string(),
      nom: z.string(),
    }),
    academie: z.object({
      id: z.string(),
      code: z.string(),
      nom: z.string(),
    }),
  })
  .openapi("Departement");

export type IDepartement = z.infer<typeof zDepartement>;
