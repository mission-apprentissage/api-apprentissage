import { zSiret, zUai } from "../zod/organismes.primitives";
import { zodOpenApi } from "../zod/zodWithOpenApi";

const zOrganisme = zodOpenApi.object({
  identifiant: zodOpenApi.object({
    uai: zUai.nullable(),
    siret: zSiret,
  }),
});

export type IOrganisme = zodOpenApi.output<typeof zOrganisme>;

export { zOrganisme };
