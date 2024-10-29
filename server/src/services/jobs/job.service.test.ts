import type { IJobOfferWritable, IJobSearchResponse } from "api-alternance-sdk";
import type { IJobOfferWritableLba, IJobSearchResponseLba } from "api-alternance-sdk/internal";
import type { RequiredDeep } from "type-fest";
import { describe, expect, it } from "vitest";

import { convertJobOfferWritableApiToLba, convertJobSearchResponseLbaToApi } from "./job.service.js";

describe("convertJobSearchResponseLbaToApi", () => {
  it("should convert job search response from LBA to API format", () => {
    const lbaResponse: IJobSearchResponseLba = {
      jobs: [
        {
          _id: "1",
          apply_phone: "0300000000",
          apply_url: "https://postler.com",
          contract_duration: 12,
          contract_remote: "onsite",
          contract_start: new Date("2021-01-28T15:00:00.000Z"),
          contract_type: ["Apprentissage"],
          offer_access_conditions: ["Ce métier est accessible avec un diplôme de fin d'études secondaires"],
          offer_creation: new Date("2021-01-01T00:00:00.000Z"),
          offer_description: "Exécute des travaux administratifs courants",
          offer_desired_skills: ["Faire preuve de rigueur et de précision"],
          offer_expiration: new Date("2021-03-28T15:00:00.000Z"),
          offer_opening_count: 1,
          offer_rome_codes: ["M1602"],
          offer_status: "Active",
          offer_target_diploma: {
            european: "4",
            label: "BP, Bac, autres formations niveau (Bac)",
          },
          offer_title: "Opérations administratives",
          offer_to_be_acquired_skills: [
            "Production, Fabrication: Procéder à l'enregistrement, au tri, à l'affranchissement du courrier",
            "Production, Fabrication: Réaliser des travaux de reprographie",
            "Organisation: Contrôler la conformité des données ou des documents",
          ],
          partner_label: "La bonne alternance",
          partner_job_id: null,
          workplace_address_label: "Paris",
          workplace_brand: "Brand",
          workplace_description: "Workplace Description",
          workplace_geopoint: {
            coordinates: [2.347, 48.8589],
            type: "Point",
          },
          workplace_idcc: "1242",
          workplace_legal_name: "ASSEMBLEE NATIONALE",
          workplace_naf_code: "84.11Z",
          workplace_naf_label: "Autorité constitutionnelle",
          workplace_name: "ASSEMBLEE NATIONALE",
          workplace_opco: "",
          workplace_siret: "11000001500013",
          workplace_size: null,
          workplace_website: null,
        },
      ],
      recruiters: [
        {
          _id: "42",
          apply_phone: "0100000000",
          apply_url: "http://localhost:3000/recherche-apprentissage?type=lba&itemId=11000001500013",
          workplace_address_label: "126 RUE DE L'UNIVERSITE 75007 PARIS",
          workplace_brand: "ASSEMBLEE NATIONALE - La vraie",
          workplace_description: null,
          workplace_geopoint: {
            coordinates: [2.347, 48.8589],
            type: "Point",
          },
          workplace_idcc: null,
          workplace_legal_name: "ASSEMBLEE NATIONALE",
          workplace_naf_code: "8411Z",
          workplace_naf_label: "Administration publique générale",
          workplace_name: "ASSEMBLEE NATIONALE - La vraie",
          workplace_opco: null,
          workplace_siret: "11000001500013",
          workplace_size: null,
          workplace_website: null,
        },
      ],
      warnings: [
        {
          code: "FRANCE_TRAVAIL_API_ERROR",
          message: "Unable to retrieve job offers from France Travail API",
        },
      ],
    };

    const expectedApiResponse: IJobSearchResponse = {
      jobs: [
        {
          identifier: {
            id: "1",
            partner_label: "La bonne alternance",
            partner_job_id: null,
          },
          workplace: {
            siret: "11000001500013",
            brand: "Brand",
            legal_name: "ASSEMBLEE NATIONALE",
            website: null,
            name: "ASSEMBLEE NATIONALE",
            description: "Workplace Description",
            size: null,
            location: {
              address: "Paris",
              geopoint: {
                coordinates: [2.347, 48.8589],
                type: "Point",
              },
            },
            domain: {
              idcc: "1242",
              opco: "",
              naf: {
                code: "84.11Z",
                label: "Autorité constitutionnelle",
              },
            },
          },
          apply: {
            url: "https://postler.com",
            phone: "0300000000",
          },
          contract: {
            start: new Date("2021-01-28T15:00:00.000Z"),
            duration: 12,
            type: ["Apprentissage"],
            remote: "onsite",
          },
          offer: {
            title: "Opérations administratives",
            rome_codes: ["M1602"],
            description: "Exécute des travaux administratifs courants",
            target_diploma: {
              european: "4",
              label: "BP, Bac, autres formations niveau (Bac)",
            },
            desired_skills: ["Faire preuve de rigueur et de précision"],
            to_be_acquired_skills: [
              "Production, Fabrication: Procéder à l'enregistrement, au tri, à l'affranchissement du courrier",
              "Production, Fabrication: Réaliser des travaux de reprographie",
              "Organisation: Contrôler la conformité des données ou des documents",
            ],
            access_conditions: ["Ce métier est accessible avec un diplôme de fin d'études secondaires"],
            publication: {
              creation: new Date("2021-01-01T00:00:00.000Z"),
              expiration: new Date("2021-03-28T15:00:00.000Z"),
            },
            opening_count: 1,
            status: "Active",
          },
        },
      ],
      recruiters: [
        {
          identifier: {
            id: "42",
          },
          workplace: {
            siret: "11000001500013",
            brand: "ASSEMBLEE NATIONALE - La vraie",
            legal_name: "ASSEMBLEE NATIONALE",
            website: null,
            name: "ASSEMBLEE NATIONALE - La vraie",
            description: null,
            size: null,
            location: {
              address: "126 RUE DE L'UNIVERSITE 75007 PARIS",
              geopoint: {
                coordinates: [2.347, 48.8589],
                type: "Point",
              },
            },
            domain: {
              idcc: null,
              opco: null,
              naf: {
                code: "8411Z",
                label: "Administration publique générale",
              },
            },
          },
          apply: {
            url: "http://localhost:3000/recherche-apprentissage?type=lba&itemId=11000001500013",
            phone: "0100000000",
          },
        },
      ],
      warnings: [
        {
          code: "FRANCE_TRAVAIL_API_ERROR",
          message: "Unable to retrieve job offers from France Travail API",
        },
      ],
    };

    const apiResponse = convertJobSearchResponseLbaToApi(lbaResponse);
    expect(apiResponse).toEqual(expectedApiResponse);
  });
});

describe("convertJobOfferWritableApiToLba", () => {
  it("should convert minimal job offer from API to LBA format", () => {
    const apiOffer: IJobOfferWritable = {
      offer: {
        title: "Opérations administratives",
        description: "Exécute des travaux administratifs courants",
      },
      workplace: {
        siret: "11000001500013",
      },
      apply: {},
    };

    const expectedLbaOffer: IJobOfferWritableLba = {
      offer_title: "Opérations administratives",
      offer_description: "Exécute des travaux administratifs courants",
      workplace_siret: "11000001500013",
    };

    expect(convertJobOfferWritableApiToLba(apiOffer)).toEqual(expectedLbaOffer);
  });

  it("should convert full job offer from API to LBA format", () => {
    const apiOffer: RequiredDeep<IJobOfferWritable> = {
      identifier: {
        partner_job_id: "1",
      },
      offer: {
        title: "Opérations administratives",
        description: "Exécute des travaux administratifs courants",
        rome_codes: ["M1602"],
        desired_skills: ["Faire preuve de rigueur et de précision"],
        to_be_acquired_skills: [
          "Production, Fabrication: Procéder à l'enregistrement, au tri, à l'affranchissement du courrier",
          "Production, Fabrication: Réaliser des travaux de reprographie",
          "Organisation: Contrôler la conformité des données ou des documents",
        ],
        target_diploma: {
          european: "4",
        },
        access_conditions: ["Ce métier est accessible avec un diplôme de fin d'études secondaires"],
        publication: {
          creation: new Date("2021-01-01T00:00:00.000Z"),
          expiration: new Date("2021-03-28T15:00:00.000Z"),
        },
        opening_count: 1,
        multicast: true,
        origin: "La bonne alternance",
      },
      workplace: {
        siret: "11000001500013",
        name: "ASSEMBLEE NATIONALE",
        description: "Workplace Description",
        website: "https://assemblee-nationale.fr",
        location: { address: "Paris" },
      },
      apply: {
        url: "https://postler.com",
        phone: "0300000000",
        email: "mail@mail.com",
      },
      contract: {
        start: new Date("2021-01-28T15:00:00.000Z"),
        duration: 12,
        type: ["Apprentissage"],
        remote: "onsite",
      },
    };

    const expectedLbaOffer: Required<IJobOfferWritableLba> = {
      partner_job_id: "1",
      offer_title: "Opérations administratives",
      offer_description: "Exécute des travaux administratifs courants",
      offer_rome_codes: ["M1602"],
      offer_desired_skills: ["Faire preuve de rigueur et de précision"],
      offer_to_be_acquired_skills: [
        "Production, Fabrication: Procéder à l'enregistrement, au tri, à l'affranchissement du courrier",
        "Production, Fabrication: Réaliser des travaux de reprographie",
        "Organisation: Contrôler la conformité des données ou des documents",
      ],
      offer_target_diploma_european: "4",
      offer_access_conditions: ["Ce métier est accessible avec un diplôme de fin d'études secondaires"],
      offer_creation: new Date("2021-01-01T00:00:00.000Z"),
      offer_expiration: new Date("2021-03-28T15:00:00.000Z"),
      offer_opening_count: 1,
      offer_multicast: true,
      offer_origin: "La bonne alternance",
      workplace_siret: "11000001500013",
      workplace_name: "ASSEMBLEE NATIONALE",
      workplace_description: "Workplace Description",
      workplace_website: "https://assemblee-nationale.fr",
      workplace_address_label: "Paris",
      apply_url: "https://postler.com",
      apply_phone: "0300000000",
      apply_email: "mail@mail.com",
      contract_start: new Date("2021-01-28T15:00:00.000Z"),
      contract_duration: 12,
      contract_type: ["Apprentissage"],
      contract_remote: "onsite",
    };

    expect(convertJobOfferWritableApiToLba(apiOffer)).toEqual(expectedLbaOffer);
  });

  it("should convert full job offer from API to LBA format", () => {
    const apiOffer: RequiredDeep<IJobOfferWritable> = {
      identifier: {
        partner_job_id: "1",
      },
      offer: {
        title: "Opérations administratives",
        description: "Exécute des travaux administratifs courants",
        rome_codes: ["M1602"],
        desired_skills: ["Faire preuve de rigueur et de précision"],
        to_be_acquired_skills: [
          "Production, Fabrication: Procéder à l'enregistrement, au tri, à l'affranchissement du courrier",
          "Production, Fabrication: Réaliser des travaux de reprographie",
          "Organisation: Contrôler la conformité des données ou des documents",
        ],
        target_diploma: {
          european: "4",
        },
        access_conditions: ["Ce métier est accessible avec un diplôme de fin d'études secondaires"],
        publication: {
          creation: new Date("2021-01-01T00:00:00.000Z"),
          expiration: new Date("2021-03-28T15:00:00.000Z"),
        },
        opening_count: 1,
        multicast: true,
        origin: "La bonne alternance",
      },
      workplace: {
        siret: "11000001500013",
        name: "ASSEMBLEE NATIONALE",
        description: "Workplace Description",
        website: "https://assemblee-nationale.fr",
        location: { address: "Paris" },
      },
      apply: {
        url: "https://postler.com",
        phone: "0300000000",
        email: "mail@mail.com",
      },
      contract: {
        start: new Date("2021-01-28T15:00:00.000Z"),
        duration: 12,
        type: ["Apprentissage"],
        remote: "onsite",
      },
    };

    const expectedLbaOffer: Required<IJobOfferWritableLba> = {
      partner_job_id: "1",
      offer_title: "Opérations administratives",
      offer_description: "Exécute des travaux administratifs courants",
      offer_rome_codes: ["M1602"],
      offer_desired_skills: ["Faire preuve de rigueur et de précision"],
      offer_to_be_acquired_skills: [
        "Production, Fabrication: Procéder à l'enregistrement, au tri, à l'affranchissement du courrier",
        "Production, Fabrication: Réaliser des travaux de reprographie",
        "Organisation: Contrôler la conformité des données ou des documents",
      ],
      offer_target_diploma_european: "4",
      offer_access_conditions: ["Ce métier est accessible avec un diplôme de fin d'études secondaires"],
      offer_creation: new Date("2021-01-01T00:00:00.000Z"),
      offer_expiration: new Date("2021-03-28T15:00:00.000Z"),
      offer_opening_count: 1,
      offer_multicast: true,
      offer_origin: "La bonne alternance",
      workplace_siret: "11000001500013",
      workplace_name: "ASSEMBLEE NATIONALE",
      workplace_description: "Workplace Description",
      workplace_website: "https://assemblee-nationale.fr",
      workplace_address_label: "Paris",
      apply_url: "https://postler.com",
      apply_phone: "0300000000",
      apply_email: "mail@mail.com",
      contract_start: new Date("2021-01-28T15:00:00.000Z"),
      contract_duration: 12,
      contract_type: ["Apprentissage"],
      contract_remote: "onsite",
    };

    expect(convertJobOfferWritableApiToLba(apiOffer)).toEqual(expectedLbaOffer);
  });

  it("should support null target_diploma", () => {
    const apiOffer: IJobOfferWritable = {
      offer: {
        title: "Opérations administratives",
        description: "Exécute des travaux administratifs courants",
        target_diploma: null,
      },
      workplace: {
        siret: "11000001500013",
      },
      apply: {},
    };

    const expectedLbaOffer: IJobOfferWritableLba = {
      offer_title: "Opérations administratives",
      offer_description: "Exécute des travaux administratifs courants",
      workplace_siret: "11000001500013",
    };

    expect(convertJobOfferWritableApiToLba(apiOffer)).toEqual(expectedLbaOffer);
  });

  it("should support null workplace_location", () => {
    const apiOffer: IJobOfferWritable = {
      offer: {
        title: "Opérations administratives",
        description: "Exécute des travaux administratifs courants",
      },
      workplace: {
        siret: "11000001500013",
        location: null,
      },
      apply: {},
    };

    const expectedLbaOffer: IJobOfferWritableLba = {
      offer_title: "Opérations administratives",
      offer_description: "Exécute des travaux administratifs courants",
      workplace_siret: "11000001500013",
    };

    expect(convertJobOfferWritableApiToLba(apiOffer)).toEqual(expectedLbaOffer);
  });
});
