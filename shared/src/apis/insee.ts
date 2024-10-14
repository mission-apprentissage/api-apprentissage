import { z } from "zod";

export const zInseeCollectiviteOutreMer = z.object({
  code: z.string(),
  intitule: z.string(),
});

export const zInseeCommuneOutreMer = z.object({
  code: z.string(),
  intitule: z.string(),
});

export type IInseeCollectiviteOutreMer = z.infer<typeof zInseeCollectiviteOutreMer>;
export type IInseeCommuneOutreMer = z.infer<typeof zInseeCommuneOutreMer>;
