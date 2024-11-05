import type { Jsonify } from "type-fest";
import { describe, expectTypeOf, it } from "vitest";
import type { z } from "zod";

import type { ParisDate } from "../internal.js";
import type {
  IJobOfferLba,
  IJobOfferWritableLba,
  IJobRecruiterLba,
  zJobRecruiterLba as _zJobRecruiterLba,
} from "./laBonneAlternance.api.js";

it("should accept Jsonify input", () => {
  type Input = z.input<typeof _zJobRecruiterLba>;

  expectTypeOf<Input>().toMatchTypeOf<Jsonify<Input>>();
});

type IJobWorkplaceExpected = {
  workplace_siret: string | null;
  workplace_brand: string | null;
  workplace_legal_name: string | null;
  workplace_website: string | null;
  workplace_name: string | null;
  workplace_description: string | null;
  workplace_size: string | null;
  workplace_address_label: string | null;
  workplace_address_street_label: string | null;
  workplace_address_city: string | null;
  workplace_address_zipcode: string | null;
  workplace_address_country: string | null;
  workplace_geopoint: {
    type: "Point";
    coordinates: [number, number];
  };
  workplace_idcc: number | null;
  workplace_opco: string | null;
  workplace_naf_code: string | null;
  workplace_naf_label: string | null;
};

type IJobApplyExpected = {
  apply_url: string;
  apply_phone: string | null;
};

type IJobRecruiterLbaExpected = IJobWorkplaceExpected &
  IJobApplyExpected & {
    _id: string;
  };

type IJobOfferExpected = IJobWorkplaceExpected &
  IJobApplyExpected & {
    _id: string | string | null;
    partner_label: string;
    partner_job_id: string | null;

    contract_start: ParisDate | null;
    contract_duration: number | null;
    contract_type: Array<"Apprentissage" | "Professionnalisation">;
    contract_remote: "onsite" | "hybrid" | "remote" | null;

    offer_title: string;
    offer_rome_codes: string[];
    offer_description: string;
    offer_target_diploma: {
      european: "3" | "4" | "5" | "6" | "7";
      label: string;
    } | null;
    offer_desired_skills: string[];
    offer_to_be_acquired_skills: string[];
    offer_access_conditions: string[];
    offer_creation: ParisDate | null;
    offer_expiration: ParisDate | null;
    offer_opening_count: number;
    offer_status: "Active" | "Filled" | "Cancelled" | "Pending";
  };

type IJobOfferWritableExpected = {
  partner_job_id?: string | null | undefined;

  contract_duration?: number | null | undefined;
  contract_type?: Array<"Apprentissage" | "Professionnalisation"> | undefined;
  contract_remote?: IJobOfferExpected["contract_remote"] | undefined;
  contract_start?: ParisDate | null | undefined;

  offer_title: string;
  offer_rome_codes?: string[] | null | undefined;
  offer_description: string;
  offer_target_diploma_european?: "3" | "4" | "5" | "6" | "7" | null | undefined;
  offer_desired_skills?: string[] | undefined;
  offer_to_be_acquired_skills?: string[] | undefined;
  offer_access_conditions?: string[] | undefined;
  offer_creation?: ParisDate | null | undefined;
  offer_expiration?: ParisDate | null | undefined;
  offer_opening_count?: number | undefined;
  offer_origin?: string | null | undefined;
  offer_multicast?: boolean | undefined;

  apply_url?: string | null | undefined;
  apply_phone?: string | null | undefined;
  apply_email?: string | null | undefined;

  workplace_siret: string;
  workplace_name?: string | null | undefined;
  workplace_website?: string | null | undefined;
  workplace_description?: string | null | undefined;
  workplace_address_label?: string | null | undefined;
  workplace_address_street_label: string | null | undefined;
  workplace_address_city: string | null | undefined;
  workplace_address_zipcode: string | null | undefined;
  workplace_address_country: string | null | undefined;
};

describe("IJobRecruiterLbaExpected", () => {
  it("should have proper typing", () => {
    expectTypeOf<IJobRecruiterLbaExpected>().branded.toEqualTypeOf<IJobRecruiterLba>();
  });
});

describe("IJobOfferLba", () => {
  it("should have proper typing", () => {
    expectTypeOf<IJobOfferLba>().branded.toEqualTypeOf<IJobOfferExpected>();
  });
});

describe("IJobsPartnersWritableApi", () => {
  it("should have proper typing", () => {
    expectTypeOf<IJobOfferWritableLba>().branded.toEqualTypeOf<IJobOfferWritableExpected>();
  });
});
