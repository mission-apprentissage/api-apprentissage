import { z } from "zod";

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

export const zFranceCompetenceDataBySource = {
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

export type ISourceFranceCompetenceDataKey = keyof typeof zFranceCompetenceDataBySource;

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

export const zFranceCompetence = z
  .object({
    _id: zObjectId,
    created_at: z.date(),
    updated_at: z.date(),
    numero_fiche: z.string().regex(/^(RNCP|RS)\d+$/),
    active: z.boolean().nullable(),
    date_premiere_publication: z.date().nullable(),
    date_derniere_publication: z.date().nullable(),
    date_premiere_activation: z.date().nullable(),
    date_derniere_activation: z.date().nullable(),
    source: z.literal("rncp"),
    data: z
      .object({
        ccn: z.array(zFranceCompetenceDataBySource.ccn),
        partenaires: z.array(zFranceCompetenceDataBySource.partenaires),
        blocs_de_competences: z.array(zFranceCompetenceDataBySource.blocs_de_competences),
        nsf: z.array(zFranceCompetenceDataBySource.nsf),
        formacode: z.array(zFranceCompetenceDataBySource.formacode),
        ancienne_nouvelle_certification: z.array(zFranceCompetenceDataBySource.ancienne_nouvelle_certification),
        voies_d_acces: z.array(zFranceCompetenceDataBySource.voies_d_acces),
        rome: z.array(zFranceCompetenceDataBySource.rome),
        certificateurs: z.array(zFranceCompetenceDataBySource.certificateurs),
        standard: zSourceFcStandard.nullable(),
      })
      .strict(),
  })
  .strict();

export const sourceFranceCompetenceModelDescriptor = {
  zod: zFranceCompetence,
  indexes,
  collectionName,
};

export type ISourceFranceCompetence = z.output<typeof zFranceCompetence>;
