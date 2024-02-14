import { IModelDescriptor } from "./common";
import emailDeniedModelDescriptor, { IEmailDenied } from "./email_denied.model";
import emailEventsModelDescriptor, { IEmailEvent } from "./email_event.model";
import sessionsModelDescriptor, { ISession } from "./session.model";
import sourceAcceModelDescriptor, { IAcce } from "./source/source.acce.model";
import sourcReferentielModelDescriptor, { IReferentiel } from "./source/source.referentiel.model";
import usersModelDescriptor, { IUser } from "./user.model";

export const modelDescriptors: IModelDescriptor[] = [
  usersModelDescriptor,
  sessionsModelDescriptor,
  emailDeniedModelDescriptor,
  emailEventsModelDescriptor,
  sourceAcceModelDescriptor,
  sourcReferentielModelDescriptor,
];

export type IDocumentMap = {
  email_denied: IEmailDenied;
  email_events: IEmailEvent;
  users: IUser;
  sessions: ISession;
  "source.acce": IAcce;
  "source.referentiel": IReferentiel;
};
