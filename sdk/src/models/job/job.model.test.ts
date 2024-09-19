import { describe, expectTypeOf, it } from "vitest";

import type { ParisDate } from "../../internal.js";
import type { IJobOffer, IJobOfferWritable, IJobRecruiter } from "./job.model.js";

type IJobRecruiterExpected = {
  identifier: {
    id: string;
  };
  workplace: {
    siret: string | null;
    brand: string | null;
    legal_name: string | null;
    website: string | null;
    name: string | null;
    description: string | null;
    size: string | null;
    location: {
      address: string;
      geopoint: {
        type: "Point";
        coordinates: [number, number];
      };
    };
    domain: {
      idcc: number | null;
      opco: string | null;
      naf: null | {
        code: string;
        label: string | null;
      };
    };
  };
  apply: {
    url: string;
    phone: string | null;
  };
};

type IJobOfferExpected = {
  identifier: {
    id: string | null;
    partner_label: string;
    partner_job_id: string | null;
  };
  workplace: IJobRecruiterExpected["workplace"];
  apply: IJobRecruiterExpected["apply"];
  contract: {
    start: ParisDate | null;
    duration: number | null;
    type: Array<"Apprentissage" | "Professionnalisation">;
    remote: "hybrid" | "onsite" | "remote" | null;
  };
  offer: {
    title: string;
    rome_codes: string[];
    description: string;
    target_diploma: {
      european: "3" | "4" | "5" | "6" | "7";
      label: string;
    } | null;
    desired_skills: string[];
    to_be_acquired_skills: string[];
    access_conditions: string[];
    publication: {
      creation: ParisDate | null;
      expiration: ParisDate | null;
    };
    opening_count: number;
    status: "Active" | "Filled" | "Cancelled" | "Pending";
  };
};

type IJobOfferWritableExpected = {
  identifier?:
    | {
        partner_job_id?: IJobOfferExpected["identifier"]["partner_job_id"];
      }
    | undefined;
  contract?:
    | {
        duration?: number | null | undefined;
        type?: Array<"Apprentissage" | "Professionnalisation"> | undefined;
        remote?: "hybrid" | "onsite" | "remote" | null | undefined;
        start?: ParisDate | null | undefined;
      }
    | undefined;
  offer: {
    title: string;
    rome_codes?: string[] | undefined;
    description: string;
    target_diploma?: {
      european: "3" | "4" | "5" | "6" | "7";
    } | null;
    desired_skills?: string[];
    to_be_acquired_skills?: string[];
    access_conditions?: string[];
    publication?: {
      creation?: ParisDate | null;
      expiration?: ParisDate | null;
    };
    opening_count?: number;
    origin?: string | null;
    multicast?: boolean;
  };
  apply: {
    url?: string | null;
    phone?: string | null;
    email?: string | null;
  };
  workplace: {
    siret: string;
    name?: string | null;
    website?: string | null;
    description?: string | null;
    location?:
      | {
          address: string;
        }
      | null
      | undefined;
  };
};

describe("IJobRecruiter", () => {
  it("should have proper typing", () => {
    expectTypeOf<IJobRecruiter["identifier"]>().branded.toEqualTypeOf<IJobRecruiterExpected["identifier"]>();
    expectTypeOf<IJobRecruiter["apply"]>().branded.toEqualTypeOf<IJobRecruiterExpected["apply"]>();
    expectTypeOf<IJobRecruiter["workplace"]>().branded.toEqualTypeOf<IJobRecruiterExpected["workplace"]>();
    expectTypeOf<IJobRecruiter>().branded.toEqualTypeOf<IJobRecruiterExpected>();
  });
});

describe("IJobOffer", () => {
  it("should have proper typing", () => {
    expectTypeOf<IJobOffer["identifier"]>().toEqualTypeOf<IJobOfferExpected["identifier"]>();
    expectTypeOf<IJobOffer["offer"]>().toEqualTypeOf<IJobOfferExpected["offer"]>();
    expectTypeOf<IJobOffer["contract"]>().toEqualTypeOf<IJobOfferExpected["contract"]>();
    expectTypeOf<IJobOffer["workplace"]>().toEqualTypeOf<IJobOfferExpected["workplace"]>();
    expectTypeOf<IJobOffer["apply"]>().toEqualTypeOf<IJobOfferExpected["apply"]>();
    expectTypeOf<IJobOffer>().toEqualTypeOf<IJobOfferExpected>();
  });
});

describe("IJobOfferWritable", () => {
  it("should have proper typing", () => {
    expectTypeOf<IJobOfferWritable["identifier"]>().toEqualTypeOf<IJobOfferWritableExpected["identifier"]>();
    expectTypeOf<IJobOfferWritable["offer"]>().toEqualTypeOf<IJobOfferWritableExpected["offer"]>();
    expectTypeOf<IJobOfferWritable["contract"]>().toEqualTypeOf<IJobOfferWritableExpected["contract"]>();
    expectTypeOf<IJobOfferWritable["workplace"]>().toEqualTypeOf<IJobOfferWritableExpected["workplace"]>();
    expectTypeOf<IJobOfferWritable["apply"]>().toEqualTypeOf<IJobOfferWritableExpected["apply"]>();
    expectTypeOf<IJobOfferWritable>().toEqualTypeOf<IJobOfferWritableExpected>();
  });
});
