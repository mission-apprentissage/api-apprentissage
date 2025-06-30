import { zGeoJsonPoint } from "api-alternance-sdk";
import { z } from "zod/v4-mini";

export const zSourceAdresseFeature = z.object({
  type: z.literal("Feature"),
  geometry: zGeoJsonPoint,
});

export const zSourceAdresseResponse = z.object({
  features: z.array(zSourceAdresseFeature),
});

export type ISourceAdresseFeature = z.infer<typeof zSourceAdresseFeature>;
export type ISourceAdresseResponse = z.infer<typeof zSourceAdresseResponse>;
