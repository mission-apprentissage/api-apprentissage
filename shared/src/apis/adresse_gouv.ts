import { zGeoJsonPoint } from "api-alternance-sdk";
import { z } from "zod";

export const zSourceAdresseFeature = z.object({
  type: z.literal("Feature"),
  geometry: zGeoJsonPoint,
});

export const zSourceAdresseResponse = z.object({
  features: zSourceAdresseFeature.array(),
});

export type ISourceAdresseFeature = z.infer<typeof zSourceAdresseFeature>;
export type ISourceAdresseResponse = z.infer<typeof zSourceAdresseResponse>;
