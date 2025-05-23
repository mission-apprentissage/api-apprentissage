import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("users").updateMany(
    {},
    {
      $set: {
        "api_keys.$[key].expiration_warning_sent": "15-days",
      },
    },
    { bypassDocumentValidation: true, arrayFilters: [{ "key.expires_at": { $lte: new Date() } }] }
  );
  await getDbCollection("users").updateMany(
    {},
    {
      $set: {
        "api_keys.$[key].expiration_warning_sent": null,
      },
    },
    { bypassDocumentValidation: true, arrayFilters: [{ "key.expiration_warning_sent": null }] }
  );
};

export const requireShutdown: boolean = true;
