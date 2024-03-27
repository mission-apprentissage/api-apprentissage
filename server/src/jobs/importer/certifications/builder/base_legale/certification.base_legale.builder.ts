import { ICertification } from "shared/models/certification.model";
import { parseNullableParisLocalDate } from "shared/zod/date.primitives";

import { ISourceAggregatedData } from "../certification.builder";

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
