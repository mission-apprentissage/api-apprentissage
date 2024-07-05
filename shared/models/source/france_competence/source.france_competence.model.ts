import { z } from "zod";

import { IModelDescriptorGeneric, zObjectId } from "../../common";
import {
  ISourceFcAncienneNouvelle,
  zSourceFcAncienneNouvelle,
} from "./parts/source.france_competence.ancienne_nouvelle.model";
import {
  ISourceFcBlocDeCompetences,
  zSourceFcBlocDeCompetences,
} from "./parts/source.france_competence.bloc_de_competences.model";
import { ISourceFcCcn, zSourceFcCcn } from "./parts/source.france_competence.ccn.model";
import { ISourceFcCertificateur, zSourceFcCertificateur } from "./parts/source.france_competence.certificateurs.model";
import { ISourceFcFormacode, zSourceFcFormacode } from "./parts/source.france_competence.formacode.model";
import { ISourceFcNsf, zSourceFcNsf } from "./parts/source.france_competence.nsf.model";
import { ISourceFcPartenaires, zSourceFcPartenaires } from "./parts/source.france_competence.partenaires.model";
import { ISourceFcRome, zSourceFcRome } from "./parts/source.france_competence.rome.model";
import { ISourceFcStandard, zSourceFcStandard } from "./parts/source.france_competence.standard.model";
import { ISourceFcVoixAcces, zSourceFcVoixAcces } from "./parts/source.france_competence.voix_acces.model";

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
