import { ICertification } from "api-alternance-sdk";
import { parseNullableParisLocalDate } from "shared/zod/date.primitives";

import { ISourceAggregatedData } from "@/jobs/importer/certifications/builder/certification.builder.js";

export function buildCertificationBaseLegale(data: ISourceAggregatedData): ICertification["base_legale"] {
  return {
    cfd:
      data.bcn == null
        ? null
        : {
            creation: parseNullableParisLocalDate(data.bcn.data.DATE_ARRETE_CREATION, "00:00:00"),
            abrogation: parseNullableParisLocalDate(data.bcn.data.DATE_ARRETE_ABROGATION, "23:59:59"),
          },
  };
}
