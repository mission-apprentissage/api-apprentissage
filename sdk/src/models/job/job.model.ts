import { z } from "zod";

import { zParisLocalDate } from "../../utils/date.primitives.js";
import { zRomeCode } from "../certification/certification.primitives.js";
import { zSiret } from "../organisme/organismes.primitives.js";
import { zGeopoint, zOfferTargetDiplomaLevel } from "./job.primitives.js";

export const zJobRecruiterWorkplace = z.object({
  siret: zSiret.nullable().describe("Siret de l'entreprise"),
  name: z.string().nullable().describe("Nom customisé de l'entreprise").default(null),
  brand: z.string().nullable().describe("Nom d'enseigne de l'établissement"),
  legal_name: z.string().nullable().describe("Nom légal de l'entreprise"),
  website: z.string().url().nullable().describe("Site web de l'entreprise").default(null),
  description: z.string().nullable().describe("description de l'entreprise").default(null),
  size: z.string().nullable().describe("Taille de l'entreprise"),
  address: z.object({
    label: z.string().describe("Adresse de l'offre, provenant du SIRET ou du partenaire"),
  }),
  geopoint: zGeopoint.describe("Geolocalisation de l'offre"),
  idcc: z.number().nullable().describe("Identifiant convention collective"),
  opco: z.string().nullable().describe("Nom de l'OPCO"),
  naf: z
    .object({
      code: z.string().describe("code NAF"),
      label: z.string().nullable().describe("Libelle NAF"),
    })
    .nullable(),
});

export const zJobRecruiterApply = z.object({
  url: z.string().url().nullable().describe("URL pour candidater").default(null),
  phone: z.string().nullable().describe("Téléphone de contact").default(null),
});

export const zJobRecruiter = z.object({
  identifier: z.object({
    id: z.string(),
  }),
  workplace: zJobRecruiterWorkplace,
  apply: zJobRecruiterApply,
});

export const zJobOfferContract = z.object({
  start: zParisLocalDate.describe("Date de début du contrat"),
  duration: z.number().nullable().describe("Durée du contrat en mois"),
  type: z
    .array(z.enum(["Apprentissage", "Professionnalisation"]))
    .nullable()
    .describe("Type de contrat"),
  remote: z.enum(["onsite", "remote", "hybrid"]).nullable().describe("Format de travail de l'offre"),
});

const zOfferStatus = z.enum(["Active", "Filled", "Cancelled", "Pending"]);

export const zJobOfferPart = z.object({
  title: z.string().min(3).describe("Titre de l'offre"),
  rome_codes: z.array(zRomeCode).describe("Code rome de l'offre"),
  description: z
    .string()
    .describe("description de l'offre, soit définit par le partenaire, soit celle du ROME si pas suffisament grande"),
  target_diploma: z
    .object({
      european: zOfferTargetDiplomaLevel.describe(
        "Niveau de diplome visé en fin d'étude, transformé pour chaque partenaire"
      ),
      label: z.string().describe("Libellé du niveau de diplome"),
    })
    .nullable(),
  desired_skills: z.array(z.string()).describe("Compétence attendues par le candidat pour l'offre").default([]),
  to_be_acquired_skills: z.array(z.string()).describe("Compétence acuqises durant l'alternance").default([]),
  access_conditions: z.array(z.string()).describe("Conditions d'accès à l'offre").default([]),
  creation: zParisLocalDate.nullable().describe("Date de creation de l'offre").default(null),
  expiration: zParisLocalDate
    .nullable()
    .describe("Date d'expiration de l'offre. Si pas présente, mettre à creation_date + 60j")
    .default(null),
  opening_count: z.number().describe("Nombre de poste disponible").default(1),
  status: zOfferStatus.describe("Status de l'offre (surtout utilisé pour les offres ajouté par API)"),
});

export type IJobRecruiter = z.output<typeof zJobRecruiter>;

export const zJobOffer = z.object({
  identifier: z.object({
    id: z.string().nullable(),
    partner: z.string(),
    partner_job_id: z.string().nullable(),
  }),
  workplace: zJobRecruiterWorkplace,
  apply: zJobRecruiterApply,
  contract: zJobOfferContract,
  offer: zJobOfferPart,
});

export type IJobOffer = z.output<typeof zJobOffer>;
