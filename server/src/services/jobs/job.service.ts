import type { IJobOffer, IJobRecruiter, IJobSearchResponse } from "api-alternance-sdk";
import type { IJobOfferLba, IJobRecruiterLba, IJobSearchResponseLba } from "api-alternance-sdk/internal";

function convertJobWorkplaceLbaToApi(input: IJobRecruiterLba | IJobOfferLba): IJobRecruiter["workplace"] {
  return {
    siret: input.workplace_siret,
    brand: input.workplace_brand,
    legal_name: input.workplace_legal_name,
    website: input.workplace_website,
    name: input.workplace_name,
    description: input.workplace_description,
    size: input.workplace_size,
    address: input.workplace_address,
    geopoint: input.workplace_geopoint,
    idcc: input.workplace_idcc,
    opco: input.workplace_opco,
    naf:
      input.workplace_naf_code === null ? null : { code: input.workplace_naf_code, label: input.workplace_naf_label },
  };
}

function convertJobApplyLbaToApi(input: IJobRecruiterLba | IJobOfferLba): IJobRecruiter["apply"] {
  return {
    url: input.apply_url,
    phone: input.apply_phone,
  };
}

function convertJobRecruiterLbaToApi(input: IJobRecruiterLba): IJobRecruiter {
  return {
    identifier: {
      id: input._id,
    },
    workplace: convertJobWorkplaceLbaToApi(input),
    apply: convertJobApplyLbaToApi(input),
  };
}

function convertJobOfferLbaToApi(input: IJobOfferLba): IJobOffer {
  return {
    identifier: {
      id: input._id,
      partner_label: input.partner_label,
      partner_job_id: input.partner_job_id,
    },

    workplace: convertJobWorkplaceLbaToApi(input),
    apply: convertJobApplyLbaToApi(input),

    contract: {
      start: input.contract_start,
      duration: input.contract_duration,
      type: input.contract_type,
      remote: input.contract_remote,
    },

    offer: {
      title: input.offer_title,
      rome_codes: input.offer_rome_codes,
      description: input.offer_description,
      target_diploma: input.offer_target_diploma,
      desired_skills: input.offer_desired_skills,
      to_be_acquired_skills: input.offer_to_be_acquired_skills,
      access_conditions: input.offer_access_conditions,
      creation: input.offer_creation,
      expiration: input.offer_expiration,
      opening_count: input.offer_opening_count,
      status: input.offer_status,
    },
  };
}

export function convertJobSearchResponseLbaToApi(lbaResponse: IJobSearchResponseLba): IJobSearchResponse {
  return {
    jobs: lbaResponse.jobs.map(convertJobOfferLbaToApi),
    recruiters: lbaResponse.recruiters.map(convertJobRecruiterLbaToApi),
    warnings: lbaResponse.warnings,
  };
}
