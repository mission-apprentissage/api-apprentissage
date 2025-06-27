import { z } from "zod/v4-mini";

export const zTransformNullIfEmptyString = z.transform<string | null, string | null>((v) => (v === "" ? null : v));
