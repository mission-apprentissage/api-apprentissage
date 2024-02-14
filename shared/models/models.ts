import { IModelDescriptor } from "./common";
import emailDeniedModelDescriptor, { IEmailDenied } from "./email_denied.model";
import emailEventsModelDescriptor, { IEmailEvent } from "./email_event.model";
import sessionsModelDescriptor, { ISession } from "./session.model";
import sourceAcceModelDescriptor, { ISourceAcce } from "./source/acce/source.acce.model";
import { ISourceBcn, sourceBcnModel } from "./source/bcn/bcn.model";
import sourcReferentielModelDescriptor, { ISourceReferentiel } from "./source/referentiel/source.referentiel.model";
import usersModelDescriptor, { IUser } from "./user.model";

export const modelDescriptors: IModelDescriptor[] = [
  usersModelDescriptor,
  sessionsModelDescriptor,
  emailDeniedModelDescriptor,
  emailEventsModelDescriptor,
  sourceAcceModelDescriptor,
  sourcReferentielModelDescriptor,
  sourceBcnModel,
];

export type IDocumentMap = {
  email_denied: IEmailDenied;
  email_events: IEmailEvent;
  users: IUser;
  sessions: ISession;
  "source.acce": ISourceAcce;
  "source.referentiel": ISourceReferentiel;
  "source.bcn": ISourceBcn;
};
