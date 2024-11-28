import { z } from "zod";

const zSourceMissionLocale = z.object({
  id: z.number(),
  code: z.string(),
  numAdherent: z.number(),
  structureStatutId: z.number(),
  structureTypeId: z.number(),
  nomStructure: z.string(),
  porteusePLIE: z.boolean(),
  porteuseMDE: z.boolean(),
  porteuseML: z.boolean(),
  effectif: z.string(),
  effectifETP: z.string(),
  adresse1: z.string().min(1),
  adresse2: z.string(),
  cp: z.string().min(1),
  ville: z.string(),
  telephones: z.string().transform((value) => (value === "" ? null : value)),
  fax: z.string(),
  siret: z.string(),
  siteWeb: z
    .string()
    .transform((value) => (value === "" ? null : value))
    .pipe(z.string().nullable()),
  emailAccueil: z
    .string()
    .transform((value) => (value === "" ? null : value))
    .pipe(z.string().email().nullable()),
  geoloc_lng: z
    .string()
    .transform((value) => (value === "" ? null : value))
    .pipe(z.string().nullable()),
  geoloc_lat: z
    .string()
    .transform((value) => (value === "" ? null : value))
    .pipe(z.string().nullable()),
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
  codeStructure: z.string(),
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
