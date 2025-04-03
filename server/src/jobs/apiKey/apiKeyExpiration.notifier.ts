import { subDays } from "date-fns";
import type { IUser } from "shared/models/user.model";

import { zUser } from "@/jobs/user.model.js";
import { sendEmail } from "@/services/mailer/mailer.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

// Constantes modifiables
const REMINDER_DAYS = {
  FIRST: 30,
  SECOND: 15,
};

export async function notifyUsersAboutExpiringApiKeys() {
  const today = new Date();

  const usersEligibles = await getDbCollection("users")
    .find({
      "api_keys.expires_at": {
        $gte: subDays(today, 1),
        $lte: new Date(today.getTime() + REMINDER_DAYS.FIRST * 24 * 60 * 60 * 1000),
      },
    })
    .toArray();

  const parsedUsers = usersEligibles.map((u: IUser) => zUser.parse(u));

  for (const user of parsedUsers) {
    for (const apiKey of user.api_keys) {
      if (!apiKey.expires_at) continue;

      const daysLeft = Math.ceil((apiKey.expires_at.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLeft === REMINDER_DAYS.FIRST || daysLeft === REMINDER_DAYS.SECOND) {
        const templateName = daysLeft === REMINDER_DAYS.FIRST ? "api-key-30-days" : "api-key-15-days";

        await sendEmail({
          name: templateName,
          to: user.email,
          data: {
            expires_at: apiKey.expires_at.toLocaleDateString("fr-FR"),
            days_left: daysLeft,
          },
        });

        console.log(`Email envoyé à ${user.email} pour une expiration dans ${daysLeft} jours.`);
      }
    }
  }
}
