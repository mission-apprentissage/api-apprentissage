import { z } from "zod/v4-mini";

const zStringTrimmed = z.string().check(z.trim(), z.minLength(1));

const zStringTrimmedNullable = z.pipe(
  z.pipe(
    z.nullable(z.string().check(z.trim())),
    z.transform((value) => value || null)
  ),
  z.nullable(zStringTrimmed.check(z.minLength(1)))
);

export const zSourceMissionLocale = z.object({
  id: z.number(),
  code: z.string(),
  numAdherent: z.number(),
  structureStatutId: z.number(),
  structureTypeId: z.number(),
  nomStructure: zStringTrimmed,
  porteusePLIE: z.boolean(),
  porteuseMDE: z.boolean(),
  porteuseML: z.boolean(),
  effectif: z.string(),
  effectifETP: z.string(),
  adresse1: zStringTrimmed.check(z.minLength(1)),
  adresse2: z.string().check(z.trim()),
  cp: z.string().check(z.minLength(1)),
  ville: z.string(),
  telephones: zStringTrimmedNullable,
  fax: z.string(),
  siret: z.string(),
  siteWeb: zStringTrimmedNullable,
  emailAccueil: zStringTrimmedNullable,
  geoloc_lng: zStringTrimmedNullable,
  geoloc_lat: zStringTrimmedNullable,
  linkedin: z.string(),
  twitter: z.string(),
  reseau: z.boolean(),
  anneeAdhesion: z.number(),
  annuaire: z.boolean(),
  facebook: z.string(),
  codeDepartement: z.string(),
  codeRegion: z.string(),
  dateModification: z.number(),
  nbAntennes: z.number(),
  codeStructure: zStringTrimmed,
  serviceCivique: z.boolean(),
  isPartenaire: z.boolean(),
  label: z.boolean(),
  labelDate: z.number(),
  typologie: z.string(),
  structureTypeLibelle: z.string(),
  structureStatutLibelle: z.string(),
  nomDepartement: z.string(),
  nomRegion: z.string(),
  alias: z.string(),
});

const zSourceCommuneMissionLocale = z.object({
  id: z.number(),
  structureId: z.number(),
  codePostal: z.string(),
  ville: z.string(),
  structure: zSourceMissionLocale,
});

export const zSourceUnmlPayload = z.object({
  results: z.array(zSourceCommuneMissionLocale),
  total: z.number(),
  success: z.literal(true),
});

export type ISourceUnmlPayload = z.infer<typeof zSourceUnmlPayload>;
export type ISourceCommuneMissionLocale = z.infer<typeof zSourceCommuneMissionLocale>;
export type ISourceMissionLocale = z.infer<typeof zSourceMissionLocale>;
