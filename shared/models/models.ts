import { IModelDescriptor } from "./common";
import emailDeniedModelDescriptor, { IEmailDenied } from "./email_denied.model";
import emailEventsModelDescriptor, { IEmailEvent } from "./email_event.model";
import sessionsModelDescriptor, { ISession } from "./session.model";
import sourceAcceModelDescriptor, { ISourceAcce } from "./source/acce/source.acce.model";
import { ISourceBcn, sourceBcnModelDescriptor } from "./source/bcn/source.bcn.model";
import {
  ISourceKitApprentissage,
  sourceKitApprentissageModelDescriptor,
} from "./source/kitApprentissage/source.kit_apprentissage.model";
import sourcReferentielModelDescriptor, { ISourceReferentiel } from "./source/referentiel/source.referentiel.model";
import usersModelDescriptor, { IUser } from "./user.model";

export const modelDescriptors: IModelDescriptor[] = [
  usersModelDescriptor,
  sessionsModelDescriptor,
  emailDeniedModelDescriptor,
  emailEventsModelDescriptor,
  sourceAcceModelDescriptor,
  sourcReferentielModelDescriptor,
  sourceBcnModelDescriptor,
  sourceKitApprentissageModelDescriptor,
];

export type IDocumentMap = {
  email_denied: IEmailDenied;
  email_events: IEmailEvent;
  users: IUser;
  sessions: ISession;
  "source.acce": ISourceAcce;
  "source.referentiel": ISourceReferentiel;
  "source.bcn": ISourceBcn;
  "source.kit_apprentissage": ISourceKitApprentissage;
};
