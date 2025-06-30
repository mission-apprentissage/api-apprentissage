import { z } from "zod/v4-mini";

import type { IModelDescriptorGeneric } from "../../common.js";
import { zObjectId } from "../../common.js";
import type { ISourceFcAncienneNouvelle } from "./parts/source.france_competence.ancienne_nouvelle.model.js";
import { zSourceFcAncienneNouvelle } from "./parts/source.france_competence.ancienne_nouvelle.model.js";
import type { ISourceFcBlocDeCompetences } from "./parts/source.france_competence.bloc_de_competences.model.js";
import { zSourceFcBlocDeCompetences } from "./parts/source.france_competence.bloc_de_competences.model.js";
import type { ISourceFcCcn } from "./parts/source.france_competence.ccn.model.js";
import { zSourceFcCcn } from "./parts/source.france_competence.ccn.model.js";
import type { ISourceFcCertificateur } from "./parts/source.france_competence.certificateurs.model.js";
import { zSourceFcCertificateur } from "./parts/source.france_competence.certificateurs.model.js";
import type { ISourceFcFormacode } from "./parts/source.france_competence.formacode.model.js";
import { zSourceFcFormacode } from "./parts/source.france_competence.formacode.model.js";
import type { ISourceFcNsf } from "./parts/source.france_competence.nsf.model.js";
import { zSourceFcNsf } from "./parts/source.france_competence.nsf.model.js";
import type { ISourceFcPartenaires } from "./parts/source.france_competence.partenaires.model.js";
import { zSourceFcPartenaires } from "./parts/source.france_competence.partenaires.model.js";
import type { ISourceFcRome } from "./parts/source.france_competence.rome.model.js";
import { zSourceFcRome } from "./parts/source.france_competence.rome.model.js";
import type { ISourceFcStandard } from "./parts/source.france_competence.standard.model.js";
import { zSourceFcStandard } from "./parts/source.france_competence.standard.model.js";
import type { ISourceFcVoixAcces } from "./parts/source.france_competence.voix_acces.model.js";
import { zSourceFcVoixAcces } from "./parts/source.france_competence.voix_acces.model.js";

const collectionName = "source.france_competence" as const;

const indexes: IModelDescriptorGeneric["indexes"] = [
  [{ numero_fiche: 1 }, { unique: true }],
  [{ created_at: 1 }, {}],
  [{ updated_at: 1 }, {}],
  [{ active: 1 }, {}],
  [{ numero_fiche: 1, date_premiere_publication: 1 }, {}],
  [{ numero_fiche: 1, date_derniere_publication: 1 }, {}],
  [{ numero_fiche: 1, date_premiere_activation: 1 }, {}],
  [{ numero_fiche: 1, date_derniere_activation: 1 }, {}],
];

export const zFranceCompetenceDataBySourceShape = {
  ccn: zSourceFcCcn,
  partenaires: zSourceFcPartenaires,
  blocs_de_competences: zSourceFcBlocDeCompetences,
  nsf: zSourceFcNsf,
  formacode: zSourceFcFormacode,
  ancienne_nouvelle_certification: zSourceFcAncienneNouvelle,
  voies_d_acces: zSourceFcVoixAcces,
  rome: zSourceFcRome,
  certificateurs: zSourceFcCertificateur,
  standard: zSourceFcStandard,
} as const;

const zFranceCompetenceDataBySource = z.object({
  ccn: z.array(zFranceCompetenceDataBySourceShape.ccn),
  partenaires: z.array(zFranceCompetenceDataBySourceShape.partenaires),
  blocs_de_competences: z.array(zFranceCompetenceDataBySourceShape.blocs_de_competences),
  nsf: z.array(zFranceCompetenceDataBySourceShape.nsf),
  formacode: z.array(zFranceCompetenceDataBySourceShape.formacode),
  ancienne_nouvelle_certification: z.array(zFranceCompetenceDataBySourceShape.ancienne_nouvelle_certification),
  voies_d_acces: z.array(zFranceCompetenceDataBySourceShape.voies_d_acces),
  rome: z.array(zFranceCompetenceDataBySourceShape.rome),
  certificateurs: z.array(zFranceCompetenceDataBySourceShape.certificateurs),
  standard: z.nullable(zSourceFcStandard),
});

export type IFranceCompetenceDataBySource = z.output<typeof zFranceCompetenceDataBySource>;
export type ISourceFranceCompetenceDataKey = keyof typeof zFranceCompetenceDataBySourceShape;

export type ISourceFranceCompetenceDataPart =
  | ISourceFcAncienneNouvelle
  | ISourceFcBlocDeCompetences
  | ISourceFcCcn
  | ISourceFcCertificateur
  | ISourceFcFormacode
  | ISourceFcNsf
  | ISourceFcPartenaires
  | ISourceFcRome
  | ISourceFcStandard
  | ISourceFcVoixAcces;

export const zFranceCompetence = z.object({
  _id: zObjectId,
  created_at: z.date(),
  updated_at: z.date(),
  numero_fiche: z.string().check(z.regex(/^(RNCP|RS)\d+$/)),
  active: z.nullable(z.boolean()),
  date_premiere_publication: z.nullable(z.date()),
  date_derniere_publication: z.nullable(z.date()),
  date_premiere_activation: z.nullable(z.date()),
  date_derniere_activation: z.nullable(z.date()),
  source: z.literal("rncp"),
  data: zFranceCompetenceDataBySource,
});

export const sourceFranceCompetenceModelDescriptor = {
  zod: zFranceCompetence,
  indexes,
  collectionName,
};

export type ISourceFranceCompetence = z.output<typeof zFranceCompetence>;
