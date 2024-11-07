import type { IJobOffer, IJobOfferWritable, IJobRecruiter, IJobSearchResponse } from "api-alternance-sdk";
import type {
  IJobOfferLba,
  IJobOfferWritableLba,
  IJobRecruiterLba,
  IJobSearchResponseLba,
} from "api-alternance-sdk/internal";
import joinNonNullStrings "shared/utils/stringUtils";


function convertJobWorkplaceLbaToApi(input: IJobRecruiterLba | IJobOfferLba): IJobRecruiter["workplace"] {
  return {
    siret: input.workplace_siret,
    brand: input.workplace_brand,
    legal_name: input.workplace_legal_name,
    website: input.workplace_website,
    name: input.workplace_name,
    description: input.workplace_description,
    size: input.workplace_size,
    location: {
      address: joinNonNullStrings([input.workplace_address_street_labelconvertJobWorkplaceLbaToApi,input.workplace_address_zipcode,input.workplace_address_city]),
      geopoint: input.workplace_geopoint,
    },
    domain: {
      idcc: input.workplace_idcc,
      opco: input.workplace_opco,
      naf:
        input.workplace_naf_code === null ? null : { code: input.workplace_naf_code, label: input.workplace_naf_label },
    },
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
      publication: {
        creation: input.offer_creation,
        expiration: input.offer_expiration,
      },
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
    if (jobOffer.identifier.partner_job_id != null) {
      result.partner_job_id = jobOffer.identifier.partner_job_id;
    }
  }

  if (jobOffer.workplace.name != null) {
    result.workplace_name = jobOffer.workplace.name;
  }
  if (jobOffer.workplace.description != null) {
    result.workplace_description = jobOffer.workplace.description;
  }
  if (jobOffer.workplace.website != null) {
    result.workplace_website = jobOffer.workplace.website;
  }
  if (jobOffer.workplace.location != null) {
    result.workplace_address_label = jobOffer.workplace.location.address;
    result.workplace_address_street_label = null; // TODO
    result.workplace_address_city = null; // TODO
    result.workplace_address_zipcode = null; // TODO
    result.workplace_address_country = null; // TODO
  }

  if (jobOffer.apply.url != null) {
    result.apply_url = jobOffer.apply.url;
  }
  if (jobOffer.apply.phone != null) {
    result.apply_phone = jobOffer.apply.phone;
  }
  if (jobOffer.apply.email != null) {
    result.apply_email = jobOffer.apply.email;
  }

  if (jobOffer.contract) {
    if (jobOffer.contract.start != null) {
      result.contract_start = jobOffer.contract.start;
    }
    if (jobOffer.contract.duration != null) {
      result.contract_duration = jobOffer.contract.duration;
    }
    if (jobOffer.contract.type != null) {
      result.contract_type = jobOffer.contract.type;
    }
    if (jobOffer.contract.remote != null) {
      result.contract_remote = jobOffer.contract.remote;
    }
  }

  if (jobOffer.offer) {
    if (jobOffer.offer.rome_codes != null) {
      result.offer_rome_codes = jobOffer.offer.rome_codes;
    }
    if (jobOffer.offer.target_diploma != null) {
      result.offer_target_diploma_european =
        jobOffer.offer.target_diploma != null ? jobOffer.offer.target_diploma.european : null;
    }
    if (jobOffer.offer.desired_skills != null) {
      result.offer_desired_skills = jobOffer.offer.desired_skills;
    }
    if (jobOffer.offer.to_be_acquired_skills != null) {
      result.offer_to_be_acquired_skills = jobOffer.offer.to_be_acquired_skills;
    }
    if (jobOffer.offer.access_conditions != null) {
      result.offer_access_conditions = jobOffer.offer.access_conditions;
    }
    if (jobOffer.offer.publication != null) {
      if (jobOffer.offer.publication.creation != null) {
        result.offer_creation = jobOffer.offer.publication.creation;
      }
      if (jobOffer.offer.publication.expiration != null) {
        result.offer_expiration = jobOffer.offer.publication.expiration;
      }
    }
    if (jobOffer.offer.opening_count != null) {
      result.offer_opening_count = jobOffer.offer.opening_count;
    }
    if (jobOffer.offer.multicast != null) {
      result.offer_multicast = jobOffer.offer.multicast;
    }
    if (jobOffer.offer.origin != null) {
      result.offer_origin = jobOffer.offer.origin;
    }
    // if (jobOffer.offer.status != null) {
    //   result.offer_status = jobOffer.offer.status;
    // }
  }

  return result;
}
