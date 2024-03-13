import { certificationsModelDescriptor, ICertification } from "./certification.model";
import { IModelDescriptor } from "./common";
import emailDeniedModelDescriptor, { IEmailDenied } from "./email_denied.model";
import emailEventsModelDescriptor, { IEmailEvent } from "./email_event.model";
import { IImportMeta, importMetaModelDescriptor } from "./import.meta.model";
import sessionsModelDescriptor, { ISession } from "./session.model";
import sourceAcceModelDescriptor, { ISourceAcce } from "./source/acce/source.acce.model";
import { ISourceBcn, sourceBcnModelDescriptor } from "./source/bcn/source.bcn.model";
import sourceCatalogueModelDescriptor, { ISourceCatalogue } from "./source/catalogue/source.catalogue.model";
import {
  ISourceFranceCompetence,
  sourceFranceCompetenceModelDescriptor,
} from "./source/france_competence/source.france_competence.model";
import {
  ISourceKitApprentissage,
  sourceKitApprentissageModelDescriptor,
} from "./source/kitApprentissage/source.kit_apprentissage.model";
import sourcReferentielModelDescriptor, { ISourceReferentiel } from "./source/referentiel/source.referentiel.model";
import usersModelDescriptor, { IUser } from "./user.model";

export const modelDescriptors: IModelDescriptor[] = [
  certificationsModelDescriptor,
  emailDeniedModelDescriptor,
  emailEventsModelDescriptor,
  importMetaModelDescriptor,
  usersModelDescriptor,
  sessionsModelDescriptor,
  sourceAcceModelDescriptor,
  sourcReferentielModelDescriptor,
  sourceBcnModelDescriptor,
  sourceKitApprentissageModelDescriptor,
  sourceCatalogueModelDescriptor,
  sourceFranceCompetenceModelDescriptor,
];

export type IDocumentMap = {
  certifications: ICertification;
  email_denied: IEmailDenied;
  email_events: IEmailEvent;
  "import.meta": IImportMeta;
  users: IUser;
  sessions: ISession;
  "source.acce": ISourceAcce;
  "source.referentiel": ISourceReferentiel;
  "source.bcn": ISourceBcn;
  "source.kit_apprentissage": ISourceKitApprentissage;
  "source.catalogue": ISourceCatalogue;
  "source.france_competence": ISourceFranceCompetence;
};
