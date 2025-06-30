import { z } from "zod/v4-mini";

export const CFD_REGEX = /^[A-Z0-9]{3}\d{3}[A-Z0-9]{2}$/;

export const zCfdNiveau = z.string().check(z.regex(/^[A-Z0-9]{3}$/));
export const zCfd = z.string().check(z.regex(CFD_REGEX));
export const zCfdParam = z.optional(
  z.pipe(
    z.pipe(
      z.string().check(z.regex(/^([A-Z0-9]{3}\d{3}[A-Z0-9]{2}|null)?$/)),
      z.transform((val) => {
        return val === "null" || !val ? null : val;
      })
    ),
    z.nullable(zCfd)
  )
);

export const RNCP_REGEX = /^RNCP\d{3,5}$/;

export const zRncp = z.string().check(z.regex(RNCP_REGEX));
export const zRncpParam = z.optional(
  z.pipe(
    z.pipe(
      z.string().check(z.regex(/^(RNCP\d{3,5}|null)?$/)),
      z.transform((val) => {
        return val === "null" || !val ? null : val;
      })
    ),
    z.nullable(zRncp)
  )
);

export const zNiveauDiplomeEuropeen = z.enum(["1", "2", "3", "4", "5", "6", "7", "8"]);

export type INiveauDiplomeEuropeen = z.output<typeof zNiveauDiplomeEuropeen>;

export const zNsfCode = z.string().check(z.regex(/^\d{2,3}[a-z]?$/));

export const zMef10 = z.string().check(z.regex(/^\d{10}$/));

export const zRomeCode = z.string().check(z.regex(/^[A-Z]{1}\d{4}$/));

export const zRomeCodeCsvParam = z.pipe(
  z.pipe(
    z.string().check(z.trim()),
    z.transform((val) => {
      return val.split(",");
    })
  ),
  z.array(zRomeCode)
);

export const zRomeCodeFlex = z.string().check(z.regex(/^[A-Z]{1}\d{0,4}$/));

export const zCfdNatureCode = z.string().check(z.regex(/^[0-9A-Z]$/));

export const zRncpBlocCompetenceCode = z.string().check(z.regex(/^(RNCP\d{3,5}BC)?\d{1,2}$/));

export const zTypeEnregistrement = z.enum(["Enregistrement de droit", "Enregistrement sur demande"]);
