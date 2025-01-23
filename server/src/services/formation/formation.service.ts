import type { IFormationSearchApiQuery, IFormationSearchApiResult } from "api-alternance-sdk";
import type { Filter } from "mongodb";
import type { IFormationInternal } from "shared/models/formation.model";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { paginate } from "@/services/pagination/pagination.service.js";

function resolveSearchQuery(query: IFormationSearchApiQuery, context: "count" | "find"): Filter<IFormationInternal> {
  const conditions: Filter<IFormationInternal>[] = [];

  if (query.romes || query.rncp) {
    const subCondition: Filter<IFormationInternal>[] = [];
    if (query.romes) {
      subCondition.push({
        "certification.valeur.domaines.rome.rncp.code": { $in: query.romes },
      });
    }
    if (query.rncp) {
      subCondition.push({
        "certification.valeur.identifiant.rncp": query.rncp,
      });
    }
    conditions.push({
      $or: subCondition,
    });
  }

  if (query.target_diploma_level) {
    conditions.push({
      $or: [
        { "certification.valeur.intitule.niveau.rncp.europeen": query.target_diploma_level },
        { "certification.valeur.intitule.niveau.cfd.europeen": query.target_diploma_level },
      ],
    });
  }

  const filter: Filter<IFormationInternal> = {
    "statut.catalogue": query.include_archived ? { $in: ["archivé", "publié"] } : "publié",
  };

  if (conditions.length > 0) {
    filter["$and"] = conditions;
  }

  if (query.longitude != null && query.latitude != null) {
    const point = {
      type: "Point",
      coordinates: [query.longitude, query.latitude],
    };

    filter["lieu.geolocalisation"] =
      context === "find"
        ? { $nearSphere: point, $maxDistance: query.radius * 1_000 }
        : // Divide by 6_371 to convert km to radians
          // https://www.mongodb.com/docs/manual/core/indexes/index-types/geospatial/2d/calculate-distances/#convert-kilometers-to-radians
          { $geoWithin: { $centerSphere: [point.coordinates, query.radius / 6_371] } };
  }

  return filter;
}

export async function searchFormation(query: IFormationSearchApiQuery): Promise<IFormationSearchApiResult> {
  return paginate(
    getDbCollection("formation"),
    query,
    resolveSearchQuery(query, "find"),
    resolveSearchQuery(query, "count")
  );
}
