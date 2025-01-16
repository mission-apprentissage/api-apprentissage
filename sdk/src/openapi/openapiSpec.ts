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
  demandeHabilitations: {
    "applications:write": {
      subject: {
        en: "Request for authorization to send applications to apprenticeship job opportunities",
        fr: "Demande d'habilitation pour l'envoi de candidature aux opportunités d'emploi en alternance",
      },
      body: {
        en: "Hello, I would like to obtain authorization to send applications to apprenticeship job opportunities on the La bonne alternance platform.",
        fr: "Bonjour, je souhaite obtenir une habilitation pour envoyer des candidature à des offres d'emploi en alternance sur la plateforme La bonne alternance.",
      },
    },
    "jobs:write": {
      subject: {
        en: "Request for authorization to post apprenticeship job offers",
        fr: "Demande d'habilitation pour le dépôt d'offres d'emploi en alternance",
      },
      body: {
        en: "Hello, I would like to obtain authorization to post apprenticeship job offers on the La bonne alternance platform.",
        fr: "Bonjour, je souhaite obtenir une habilitation pour déposer des offres d'emploi en alternance sur la plateforme La bonne alternance.",
      },
    },
    "appointments:write": {
      subject: {
        en: "Request for authorization to generate appointment links with training centers",
        fr: "Demande d'habilitation pour la génération de lien de rendez-vous avec les centres de formation",
      },
      body: {
        en: "Hello, I would like to obtain authorization to post apprenticeship job offers on the La bonne alternance platform.",
        fr: "Bonjour, je souhaite obtenir une habilitation pour déposer des offres d'emploi en alternance sur la plateforme La bonne alternance.",
      },
    },
  },
};
