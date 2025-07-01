import { add } from "date-fns";
import { getDbCollection } from "../mongodb/mongodbService.js";

export async function removeInactiveAccounts(): Promise<void> {
  await getDbCollection("users").deleteMany({
    updated_at: { $lte: add(new Date(), { years: -2 }) },
  });
}
