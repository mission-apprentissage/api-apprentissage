import { ObjectId } from "mongodb";
import { IEmailError, IEmailEvent } from "shared/models/email_event.model";

import { getDbCollection } from "@/common/utils/mongodbUtils";

export async function createEmailEvent(template: IEmailEvent["template"]) {
  const now = new Date();

  const event: IEmailEvent = {
    _id: new ObjectId(),
    email: template.to,
    template,
    opened_at: null,
    delivered_at: null,
    created_at: now,
    updated_at: now,
    messageId: null,
    errors: [],
  };

  await getDbCollection("email_events").insertOne(event);
  return event;
}

export function setEmailMessageId(emailEvent: IEmailEvent, messageId: string) {
  return getDbCollection("email_events").findOneAndUpdate(
    { _id: emailEvent._id },
    {
      $set: {
        updated_at: new Date(),
        messageId,
      },
    },
    { returnDocument: "after" }
  );
}

export function addEmailError(filter: Pick<IEmailEvent, "_id"> | Pick<IEmailEvent, "messageId">, err: IEmailError) {
  return getDbCollection("email_events").findOneAndUpdate(
    filter,
    {
      $push: {
        errors: err,
      },
      $set: {
        updated_at: new Date(),
      },
    },
    { returnDocument: "after" }
  );
}

export async function markEmailAsDelivered(messageId: string) {
  const now = new Date();
  await getDbCollection("email_events").findOneAndUpdate(
    { messageId },
    {
      $set: {
        delivered_at: now,
        updated_at: now,
      },
    }
  );
}

export async function markEmailAsFailed(messageId: string, type: IEmailError["type"]) {
  return addEmailError({ messageId }, { type });
}

export async function markEmailAsOpened(id: ObjectId) {
  const now = new Date();
  await getDbCollection("email_events").findOneAndUpdate(
    { _id: id },
    {
      $set: {
        opened_at: now,
        updated_at: now,
      },
    }
  );
}

export async function unsubscribe(email: string) {
  const now = new Date();

  await getDbCollection("email_denied").updateOne(
    {
      email,
    },
    {
      $set: {
        reason: "unsubscribe",
        updated_at: now,
      },
      $setOnInsert: {
        email,
        created_at: now,
      },
    },
    { upsert: true }
  );
}

export async function isUnsubscribed(email: string): Promise<boolean> {
  const denied = await getDbCollection("email_denied").findOne(
    {
      email,
    },
    { projection: { _id: 0, email: 1 } }
  );

  return denied !== null;
}
