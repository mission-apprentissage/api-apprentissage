import { z } from "zod";

import { zParisLocalDateNullable } from "../../utils/date.primitives.js";
import { zRomeCode } from "../certification/certification.primitives.js";
import { zSiret } from "../organisme/organismes.primitives.js";
import { zGeopoint, zOfferTargetDiplomaLevel } from "./job.primitives.js";

const zWorkplaceLocation = z.object({
  address: z.string(),
  geopoint: zGeopoint,
});

const zJobRecruiterWorkplaceWritable = z
  .object({
    siret: zSiret,
    name: z.string().nullable(),
    description: z.string().nullable(),
    website: z.string().url().nullable(),
    location: zWorkplaceLocation.pick({ address: true }).nullable(),
  })
  .partial()
  .required({ siret: true });

const zJobRecruiterWorkplace = zJobRecruiterWorkplaceWritable
  .required()
  .omit({
    siret: true,
    location: true,
  })
  .extend({
    siret: zJobRecruiterWorkplaceWritable.shape.siret.nullable(),
    location: zWorkplaceLocation,

    brand: z.string().nullable(),
    legal_name: z.string().nullable(),
    size: z.string().nullable(),

    domain: z.object({
      idcc: z.number().nullable(),
      opco: z.string().nullable(),
      naf: z
        .object({
          code: z.string(),
          label: z.string().nullable(),
        })
        .nullable(),
    }),
  });

const zApplyUrl = z.string().url();

const zJobRecruiterApplyWritable = z
  .object({
    email: z.string().email().nullable(),
    url: zApplyUrl.nullable(),
    phone: z.string().nullable(),
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
    start: zParisLocalDateNullable,
    duration: z.number().nullable(),
    type: z.array(z.enum(["Apprentissage", "Professionnalisation"])),
    remote: z.enum(["onsite", "remote", "hybrid"]).nullable(),
  })
  .partial();

const zJobOfferContract = zJobOfferContractWritable.required();

const zOfferStatus = z.enum(["Active", "Filled", "Cancelled", "Pending"]);

const zJobOfferPublication = z.object({
  creation: zParisLocalDateNullable,
  expiration: zParisLocalDateNullable,
});

const zJobOfferPartWritable = z
  .object({
    title: z.string().min(3),
    description: z.string(),
    rome_codes: z.array(zRomeCode),
    desired_skills: z.array(z.string()),
    to_be_acquired_skills: z.array(z.string()),
    access_conditions: z.array(z.string()),
    opening_count: z.number(),
    target_diploma: z
      .object({
        european: zOfferTargetDiplomaLevel,
      })
      .nullable(),
    publication: zJobOfferPublication.partial(),
    multicast: z.boolean(),
    origin: z.string().nullable(),
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
    publication: true,
  })
  .extend({
    rome_codes: zRomeCode.array(),
    description: zJobOfferPartWritable.shape.description.min(30),
    target_diploma: z
      .object({
        european: zOfferTargetDiplomaLevel,
        label: z.string(),
      })
      .nullable(),
    status: zOfferStatus,
    publication: zJobOfferPublication,
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
