import type { z } from "zod";

import { zodOpenApi } from "../../utils/zodWithOpenApi.js";

export const CFD_REGEX = /^[A-Z0-9]{3}\d{3}[A-Z0-9]{2}$/;

export const zCfdNiveau = zodOpenApi.string().regex(/^[A-Z0-9]{3}$/);
export const zCfd = zodOpenApi.string().regex(CFD_REGEX);
export const zCfdParam = zodOpenApi
  .string()
  .regex(/^([A-Z0-9]{3}\d{3}[A-Z0-9]{2}|null)?$/)
  .transform((val) => (val === "null" || !val ? null : val));

export const RNCP_REGEX = /^RNCP\d{3,5}$/;

export const zRncp = zodOpenApi.string().regex(RNCP_REGEX);
export const zRncpParam = zodOpenApi
  .string()
  .regex(/^(RNCP\d{3,5}|null)?$/)
  .transform((val) => (val === "null" || !val ? null : val));

export const zNiveauDiplomeEuropeen = zodOpenApi.enum(["1", "2", "3", "4", "5", "6", "7", "8"]);

export type INiveauDiplomeEuropeen = z.output<typeof zNiveauDiplomeEuropeen>;

export const zNsfCode = zodOpenApi.string().regex(/^\d{2,3}[a-z]?$/);

export const zRomeCode = zodOpenApi.string().regex(/^[A-Z]{1}\d{4}$/);

export const zRomeCodeFlex = zodOpenApi.string().regex(/^[A-Z]{1}\d{2,4}$/);

export const zCfdNatureCode = zodOpenApi.string().regex(/^[0-9A-Z]$/);

export const zRncpBlocCompetenceCode = zodOpenApi.string().regex(/^(RNCP\d{3,5}BC)?\d{1,2}$/);

export const zTypeEnregistrement = zodOpenApi.enum(["Enregistrement de droit", "Enregistrement sur demande"]);

export const zCertificationCode = zodOpenApi
  .string()
  .refine(
    (val) => {
      const parts = val.split(".");
      if (parts.length > 2) {
        return { message: 'Invalid certification code expected format "<cfd>.<rncp>" or "<rncp>.<cfd>"', path: [] };
      }
      return parts.length <= 2;
    },
    { message: 'Invalid certification code expected format "<cfd>.<rncp>" or "<rncp>.<cfd>"', path: [] }
  )
  .transform((val) => val.split("."));
