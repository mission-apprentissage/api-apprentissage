import { z } from "zod";

import { zOfferTargetDiplomaLevel } from "../models/index.js";
import { zJobOffer, zJobRecruiter } from "../models/job/job.model.js";

export const zJobRecruiterLba = z.object({
  _id: zJobRecruiter.shape.identifier.shape.id,
  workplace_siret: zJobRecruiter.shape.workplace.shape.siret,
  workplace_brand: zJobRecruiter.shape.workplace.shape.brand,
  workplace_legal_name: zJobRecruiter.shape.workplace.shape.legal_name,
  workplace_website: zJobRecruiter.shape.workplace.shape.website,
  workplace_name: zJobRecruiter.shape.workplace.shape.name,
  workplace_description: zJobRecruiter.shape.workplace.shape.description,
  workplace_size: zJobRecruiter.shape.workplace.shape.size,
  workplace_address: zJobRecruiter.shape.workplace.shape.address,
  workplace_geopoint: zJobRecruiter.shape.workplace.shape.geopoint,
  workplace_idcc: zJobRecruiter.shape.workplace.shape.idcc,
  workplace_opco: zJobRecruiter.shape.workplace.shape.opco,
  workplace_naf_code: zJobRecruiter.shape.workplace.shape.naf.unwrap().shape.code.nullable(),
  workplace_naf_label: zJobRecruiter.shape.workplace.shape.naf.unwrap().shape.label,
  apply_url: zJobRecruiter.shape.apply.shape.url,
  apply_phone: zJobRecruiter.shape.apply.shape.phone,
});

export type IJobRecruiterLba = z.output<typeof zJobRecruiterLba>;

export const zJobOfferLba = zJobRecruiterLba
  .omit({
    _id: true,
  })
  .extend({
    _id: zJobOffer.shape.identifier.shape.id,
    partner_label: zJobOffer.shape.identifier.shape.partner_label,
    partner_job_id: zJobOffer.shape.identifier.shape.partner_job_id,
    contract_start: zJobOffer.shape.contract.shape.start,
    contract_duration: zJobOffer.shape.contract.shape.duration,
    contract_type: zJobOffer.shape.contract.shape.type,
    contract_remote: zJobOffer.shape.contract.shape.remote,
    offer_title: zJobOffer.shape.offer.shape.title,
    offer_rome_codes: zJobOffer.shape.offer.shape.rome_codes,
    offer_description: zJobOffer.shape.offer.shape.description,
    offer_target_diploma: zJobOffer.shape.offer.shape.target_diploma,
    offer_desired_skills: zJobOffer.shape.offer.shape.desired_skills,
    offer_to_be_acquired_skills: zJobOffer.shape.offer.shape.to_be_acquired_skills,
    offer_access_conditions: zJobOffer.shape.offer.shape.access_conditions,
    offer_creation: zJobOffer.shape.offer.shape.creation,
    offer_expiration: zJobOffer.shape.offer.shape.expiration,
    offer_opening_count: zJobOffer.shape.offer.shape.opening_count,
    offer_status: zJobOffer.shape.offer.shape.status,
  });

export type IJobOfferLba = z.output<typeof zJobOfferLba>;

export const zJobSearchResponseLba = z.object({
  jobs: zJobOfferLba.array(),
  recruiters: zJobRecruiterLba.array(),
  warnings: z.array(z.object({ message: z.string(), code: z.string() })),
});

export type IJobSearchResponseLba = z.output<typeof zJobSearchResponseLba>;

export const zJobOfferWritableLba = zJobOfferLba
  .pick({
    partner_job_id: true,

    contract_duration: true,
    contract_type: true,
    contract_remote: true,
    contract_start: true,

    offer_title: true,
    offer_rome_codes: true,
    offer_description: true,
    offer_desired_skills: true,
    offer_to_be_acquired_skills: true,
    offer_access_conditions: true,
    offer_creation: true,
    offer_expiration: true,
    offer_opening_count: true,

    apply_url: true,
    apply_phone: true,

    workplace_siret: true,
    workplace_name: true,
    workplace_website: true,
    workplace_description: true,
  })
  .extend({
    offer_target_diploma_european: zOfferTargetDiplomaLevel.nullable(),
    offer_origin: z.string().nullable(),
    offer_multicast: z.boolean(),

    apply_email: z.string().email().nullable(),

    workplace_siret: z.string(),
    workplace_address_label: z.string().nullable(),
  })
  .partial()
  .required({
    offer_title: true,
    offer_description: true,
    workplace_siret: true,
  });

export type IJobOfferWritableLba = z.output<typeof zJobOfferWritableLba>;
