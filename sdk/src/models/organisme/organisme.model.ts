import { z } from "zod";

import { zSiret, zUai } from "./organismes.primitives.js";

export const zOrganisme = z.object({
  identifiant: z.object({
    uai: zUai.nullable(),
    siret: zSiret,
  }),
});

export type IOrganisme = z.output<typeof zOrganisme>;
