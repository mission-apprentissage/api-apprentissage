import { IModelDescriptor } from "./common";
import emailDeniedModelDescriptor, { IEmailDenied } from "./email_denied.model";
import emailEventsModelDescriptor, { IEmailEvent } from "./email_event.model";
import sessionsModelDescriptor, { ISession } from "./session.model";
import usersModelDescriptor, { IUser } from "./user.model";

export const modelDescriptors: IModelDescriptor[] = [
  usersModelDescriptor,
  sessionsModelDescriptor,
  emailDeniedModelDescriptor,
  emailEventsModelDescriptor,
];

export type IDocumentMap = {
  email_denied: IEmailDenied;
  email_events: IEmailEvent;
  users: IUser;
  sessions: ISession;
};
