import type { IJobOffer, IJobOfferWritable, IJobRecruiter, IJobSearchResponse } from "api-alternance-sdk";
import type {
  IJobOfferLba,
  IJobOfferWritableLba,
  IJobRecruiterLba,
  IJobSearchResponseLba,
} from "api-alternance-sdk/internal";

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

export function convertJobOfferWritableApiToLba(jobOffer: IJobOfferWritable): IJobOfferWritableLba {
  const result: IJobOfferWritableLba = {
    offer_title: jobOffer.offer.title,
    offer_description: jobOffer.offer.description,
    workplace_siret: jobOffer.workplace.siret,
  };

  if (jobOffer.identifier) {
    if ("partner_job_id" in jobOffer.identifier) {
      result.partner_job_id = jobOffer.identifier.partner_job_id;
    }
  }

  if ("name" in jobOffer.workplace) {
    result.workplace_name = jobOffer.workplace.name;
  }
  if ("description" in jobOffer.workplace) {
    result.workplace_description = jobOffer.workplace.description;
  }
  if ("website" in jobOffer.workplace) {
    result.workplace_website = jobOffer.workplace.website;
  }
  if ("address" in jobOffer.workplace) {
    result.workplace_address_label = jobOffer.workplace.address != null ? jobOffer.workplace.address.label : null;
  }

  if ("url" in jobOffer.apply) {
    result.apply_url = jobOffer.apply.url;
  }
  if ("phone" in jobOffer.apply) {
    result.apply_phone = jobOffer.apply.phone;
  }
  if ("email" in jobOffer.apply) {
    result.apply_email = jobOffer.apply.email;
  }

  if (jobOffer.contract) {
    if ("start" in jobOffer.contract) {
      result.contract_start = jobOffer.contract.start;
    }
    if ("duration" in jobOffer.contract) {
      result.contract_duration = jobOffer.contract.duration;
    }
    if ("type" in jobOffer.contract) {
      result.contract_type = jobOffer.contract.type;
    }
    if ("remote" in jobOffer.contract) {
      result.contract_remote = jobOffer.contract.remote;
    }
  }

  if (jobOffer.offer) {
    if ("rome_codes" in jobOffer.offer && jobOffer.offer.rome_codes !== undefined) {
      result.offer_rome_codes = jobOffer.offer.rome_codes;
    }
    if ("target_diploma" in jobOffer.offer && jobOffer.offer.target_diploma !== undefined) {
      result.offer_target_diploma_european =
        jobOffer.offer.target_diploma != null ? jobOffer.offer.target_diploma.european : null;
    }
    if ("desired_skills" in jobOffer.offer && jobOffer.offer.desired_skills != undefined) {
      result.offer_desired_skills = jobOffer.offer.desired_skills;
    }
    if ("to_be_acquired_skills" in jobOffer.offer) {
      result.offer_to_be_acquired_skills = jobOffer.offer.to_be_acquired_skills;
    }
    if ("access_conditions" in jobOffer.offer) {
      result.offer_access_conditions = jobOffer.offer.access_conditions;
    }
    if ("creation" in jobOffer.offer) {
      result.offer_creation = jobOffer.offer.creation;
    }
    if ("expiration" in jobOffer.offer) {
      result.offer_expiration = jobOffer.offer.expiration;
    }
    if ("opening_count" in jobOffer.offer) {
      result.offer_opening_count = jobOffer.offer.opening_count;
    }
    if ("multicast" in jobOffer.offer) {
      result.offer_multicast = jobOffer.offer.multicast;
    }
    if ("origin" in jobOffer.offer) {
      result.offer_origin = jobOffer.offer.origin;
    }
    // if ("status" in jobOffer.offer) {
    //   result.offer_status = jobOffer.offer.status;
    // }
  }

  return result;
}
