import type { IMissionLocale, IMissionLocaleSearchApiQuery } from "api-alternance-sdk";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export async function searchMissionLocales(query: IMissionLocaleSearchApiQuery) {
  const groupStage = [
    { $sort: { "mission_locale.id": 1 } },
    {
      $group: {
        _id: "$mission_locale.id",
        mission_locale: { $first: "$mission_locale" },
        distance: { $first: "$distance" },
      },
    },
  ];
  const filterStage = { $match: { _id: { $ne: null } } };
  const replaceRootStage = { $replaceRoot: { newRoot: "$mission_locale" } };

  if (query.longitude != null && query.latitude != null) {
    return getDbCollection("commune")
      .aggregate<IMissionLocale>([
        {
          $geoNear: {
            distanceField: "distance",
            key: "mission_locale.localisation.geopoint",
            maxDistance: query.radius * 1_000,
            near: {
              type: "Point",
              coordinates: [query.longitude, query.latitude],
            },
            spherical: true,
          },
        },
        ...groupStage,
        filterStage,
        { $sort: { distance: 1 } },
        replaceRootStage,
      ])
      .toArray();
  }

  return getDbCollection("commune")
    .aggregate<IMissionLocale>([...groupStage, filterStage, replaceRootStage])
    .toArray();
}
