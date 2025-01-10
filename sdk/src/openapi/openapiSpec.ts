import { certificationModelOpenapi } from "../models/certification/certification.model.openapi.js";
import { communeModelOpenapi } from "../models/geographie/commune.model.openapi.js";
import { departementModelOpenapi } from "../models/geographie/departement.model.openapi.js";
import { missionLocaleModelOpenapi } from "../models/geographie/mission-locale.model.openapi.js";
import {
  applicationWriteModelOpenapi,
  offerReadModelOpenapi,
  offerWriteModelOpenapi,
  recruiterModelOpenapi,
} from "../models/job/job.model.openapi.js";
import { certificationsRoutesOpenapi } from "../routes/certification/certification.routes.openapi.js";
import { geographieRoutesOpenapi } from "../routes/geographie/geographie.routes.openapi.js";
import { jobRoutesOpenapi } from "../routes/jobs/job.routes.openapi.js";
import { organismeRoutesOpenapi } from "../routes/organisme/organisme.routes.openapi.js";
import { tagsOpenapi } from "./tags.openapi.js";
import type { OpenapiSpec } from "./types.js";

export const openapiSpec: OpenapiSpec = {
  models: {
    [certificationModelOpenapi.name]: certificationModelOpenapi,
    [communeModelOpenapi.name]: communeModelOpenapi,
    [departementModelOpenapi.name]: departementModelOpenapi,
    [missionLocaleModelOpenapi.name]: missionLocaleModelOpenapi,
    [recruiterModelOpenapi.name]: recruiterModelOpenapi,
    [offerReadModelOpenapi.name]: offerReadModelOpenapi,
    [offerWriteModelOpenapi.name]: offerWriteModelOpenapi,
    [applicationWriteModelOpenapi.name]: applicationWriteModelOpenapi,
  },
  routes: {
    ...jobRoutesOpenapi,
    ...certificationsRoutesOpenapi,
    ...geographieRoutesOpenapi,
    ...organismeRoutesOpenapi,
  },
  tags: tagsOpenapi,
};
