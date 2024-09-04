import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("users").updateMany(
    {
      email: {
        $in: [
          "moroine.bentefrit@beta.gouv.fr",
          "antoine.bigard@beta.gouv.fr",
          "kevin.barnoin@beta.gouv.fr",
          "leo.radisson@beta.gouv.fr",
          "samir.benfares@beta.gouv.fr",
          "sofia.boulaarab@beta.gouv.fr",
          "marion.guillet@beta.gouv.fr",
          "claire.arnaud@beta.gouv.fr",
          "tdb@alternance.beta.gouv.fr",
          "catherine.bourreau@beta.gouv.fr",
        ],
      },
    },
    { $set: { type: "mission_apprentissage" } }
  );
};
