import { z } from "zod";

import { zSiret, zUai } from "./organisme/organismes.primitives.js";

const zOrganisme = z.object({
  identifiant: z.object({
    uai: zUai.nullable(),
    siret: zSiret,
  }),
});

export type IOrganisme = z.output<typeof zOrganisme>;

export { zOrganisme };
