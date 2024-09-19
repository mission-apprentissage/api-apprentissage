import { z } from "zod";

import { zParisLocalDate } from "../../utils/date.primitives.js";
import { zRomeCode } from "../certification/certification.primitives.js";
import { zSiret } from "../organisme/organismes.primitives.js";
import { zGeopoint, zOfferTargetDiplomaLevel } from "./job.primitives.js";

const zWorkspaceAddress = z.object({
  label: z.string().describe("Adresse de l'offre, provenant du SIRET ou du partenaire"),
});

const zJobRecruiterWorkplaceWritable = z
  .object({
    siret: zSiret.describe("Siret de l'entreprise"),
    name: z.string().nullable().describe("Nom customisé de l'entreprise"),
    description: z.string().nullable().describe("description de l'entreprise"),
    website: z.string().url().nullable().describe("Site web de l'entreprise"),
    address: zWorkspaceAddress.nullable(),
  })
  .partial()
  .required({ siret: true });

const zJobRecruiterWorkplace = zJobRecruiterWorkplaceWritable
  .required()
  .omit({
    siret: true,
    address: true,
  })
  .extend({
    siret: zJobRecruiterWorkplaceWritable.shape.siret.nullable(),
    address: zWorkspaceAddress,

    brand: z.string().nullable().describe("Nom d'enseigne de l'établissement"),
    legal_name: z.string().nullable().describe("Nom légal de l'entreprise"),
    size: z.string().nullable().describe("Taille de l'entreprise"),

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

const zApplyUrl = z.string().url().describe("URL pour candidater");

const zJobRecruiterApplyWritable = z
  .object({
    email: z.string().email().nullable().describe("Email de contact"),
    url: zApplyUrl.nullable(),
    phone: z.string().nullable().describe("Téléphone de contact"),
  })
  .partial();

const zJobRecruiterApply = zJobRecruiterApplyWritable
  .required()
  .omit({
    email: true,
    url: true,
  })
  .extend({
    url: zApplyUrl,
  });

const zJobRecruiter = z.object({
  identifier: z.object({
    id: z.string(),
  }),
  workplace: zJobRecruiterWorkplace,
  apply: zJobRecruiterApply,
});

const zJobOfferIdentifierWritable = z
  .object({
    partner_job_id: z.string().nullable(),
  })
  .partial();

const zJobOfferIdentifier = zJobOfferIdentifierWritable.required().extend({
  id: z.string().nullable(),
  partner_label: z.string(),
});

const zJobOfferContractWritable = z
  .object({
    start: zParisLocalDate.nullable().describe("Date de début du contrat"),
    duration: z.number().nullable().describe("Durée du contrat en mois"),
    type: z.array(z.enum(["Apprentissage", "Professionnalisation"])).describe("Type de contrat"),
    remote: z.enum(["onsite", "remote", "hybrid"]).nullable().describe("Format de travail de l'offre"),
  })
  .partial();

const zJobOfferContract = zJobOfferContractWritable.required();

const zOfferStatus = z.enum(["Active", "Filled", "Cancelled", "Pending"]);

const zJobOfferPartWritable = z
  .object({
    title: z.string().min(3).describe("Titre de l'offre"),
    description: z
      .string()
      .describe("description de l'offre, soit définit par le partenaire, soit celle du ROME si pas suffisament grande"),
    rome_codes: z.array(zRomeCode).describe("Code rome de l'offre").nullable(),
    desired_skills: z.array(z.string()).describe("Compétence attendues par le candidat pour l'offre"),
    to_be_acquired_skills: z.array(z.string()).describe("Compétence acuqises durant l'alternance"),
    access_conditions: z.array(z.string()).describe("Conditions d'accès à l'offre"),
    opening_count: z.number().describe("Nombre de poste disponible"),
    target_diploma: z
      .object({
        european: zOfferTargetDiplomaLevel.describe(
          "Niveau de diplome visé en fin d'étude, transformé pour chaque partenaire"
        ),
      })
      .nullable(),
    creation: zParisLocalDate.nullable().describe("Date de creation de l'offre"),
    expiration: zParisLocalDate
      .nullable()
      .describe("Date d'expiration de l'offre. Si pas présente, mettre à creation_date + 60j"),
    multicast: z.boolean().describe("Si l'offre peut être diffusé sur l'ensemble des plateformes partenaires"),
    origin: z.string().nullable().describe("Origine de l'offre provenant d'un aggregateur"),
  })
  .partial()
  .required({
    title: true,
    description: true,
  });

const zJobOfferPart = zJobOfferPartWritable
  .required()
  .omit({
    rome_codes: true,
    origin: true,
    multicast: true,
    description: true,
    target_diploma: true,
  })
  .extend({
    rome_codes: zRomeCode.array(),
    description: zJobOfferPartWritable.shape.description
      .min(30)
      .describe("description de l'offre, soit définit par le partenaire, soit celle du ROME si pas suffisament grande"),
    target_diploma: z
      .object({
        european: zOfferTargetDiplomaLevel,
        label: z.string().describe("Libellé du niveau de diplome"),
      })
      .nullable(),
    status: zOfferStatus.describe("Status de l'offre (surtout utilisé pour les offres ajouté par API)"),
  });

const zJobOffer = z.object({
  identifier: zJobOfferIdentifier,
  workplace: zJobRecruiterWorkplace,
  apply: zJobRecruiterApply,
  contract: zJobOfferContract,
  offer: zJobOfferPart,
});

type IJobOffer = z.output<typeof zJobOffer>;

const zJobOfferWritable = z
  .object({
    identifier: zJobOfferIdentifierWritable,
    workplace: zJobRecruiterWorkplaceWritable,
    apply: zJobRecruiterApplyWritable,
    contract: zJobOfferContractWritable,
    offer: zJobOfferPartWritable,
  })
  .partial({
    identifier: true,
    contract: true,
  });

type IJobOfferWritable = z.output<typeof zJobOfferWritable>;
type IJobRecruiter = z.output<typeof zJobRecruiter>;

export type { IJobOffer, IJobOfferWritable, IJobRecruiter };

export { zJobRecruiter, zJobOffer, zJobOfferWritable };
