import { addDays, differenceInDays, endOfDay, startOfDay } from "date-fns";
import type { IUser } from "shared/models/user.model";

import { sendEmail } from "@/services/mailer/mailer.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

function shouldSendNotification(
  apiKey: IUser["api_keys"][number],
  today: Date
): { type: "30-days" | "15-days"; days_left: number } | null {
  const days_left = differenceInDays(startOfDay(apiKey.expires_at), today);

  if (days_left <= 15) {
    return apiKey.expiration_warning_sent === "15-days" ? null : { days_left, type: "15-days" };
  }

  if (days_left <= 30) {
    return apiKey.expiration_warning_sent === "30-days" ? null : { days_left, type: "30-days" };
  }

  return null;
}

export async function notifyUsersAboutExpiringApiKeys(signal: AbortSignal) {
  const today = startOfDay(new Date());

  const in30Days = endOfDay(addDays(today, 30));

  const cursor = getDbCollection("users").aggregate([
    {
      $match: {
        "api_keys.expires_at": { $lte: in30Days },
      },
    },
  ]);

  for await (const user of cursor) {
    if (signal.aborted) {
      cursor.close();
      break;
    }

    for (const apiKey of user.api_keys) {
      const decision = shouldSendNotification(apiKey, today);
      if (!decision) continue;

      await sendEmail({
        name: "api-key-will-expire",
        to: user.email,
        days_left: decision.days_left,
        expires_at: {
          fr: apiKey.expires_at.toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          en: apiKey.expires_at.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
        key_name: apiKey.name,
      });

      await getDbCollection("users").updateOne(
        { "api_keys._id": apiKey._id },
        {
          $set: {
            "api_keys.$.expiration_warning_sent": decision.type,
          },
        }
      );
    }
  }
}
