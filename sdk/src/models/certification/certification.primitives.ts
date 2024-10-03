import { z } from "zod";

export const CFD_REGEX = /^[A-Z0-9]{3}\d{3}[A-Z0-9]{2}$/;

export const zCfdNiveau = z.string().regex(/^[A-Z0-9]{3}$/);
export const zCfd = z.string().regex(CFD_REGEX);
export const zCfdParam = z
  .string()
  .regex(/^([A-Z0-9]{3}\d{3}[A-Z0-9]{2}|null)?$/)
  .transform((val) => (val === "null" || !val ? null : val));

export const RNCP_REGEX = /^RNCP\d{3,5}$/;

export const zRncp = z.string().regex(RNCP_REGEX);
export const zRncpParam = z
  .string()
  .regex(/^(RNCP\d{3,5}|null)?$/)
  .transform((val) => (val === "null" || !val ? null : val));

export const zNiveauDiplomeEuropeen = z.enum(["1", "2", "3", "4", "5", "6", "7", "8"]);

export type INiveauDiplomeEuropeen = z.output<typeof zNiveauDiplomeEuropeen>;

export const zNsfCode = z.string().regex(/^\d{2,3}[a-z]?$/);

export const zRomeCode = z.string().regex(/^[A-Z]{1}\d{4}$/);

export const zRomeCodeFlex = z.string().regex(/^[A-Z]{1}\d{0,4}$/);

export const zCfdNatureCode = z.string().regex(/^[0-9A-Z]$/);

export const zRncpBlocCompetenceCode = z.string().regex(/^(RNCP\d{3,5}BC)?\d{1,2}$/);

export const zTypeEnregistrement = z.enum(["Enregistrement de droit", "Enregistrement sur demande"]);

export const zCertificationCode = z
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
