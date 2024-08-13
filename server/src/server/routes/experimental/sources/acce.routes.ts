import { AbstractCursor, Document, Filter } from "mongodb";
import { zRoutes } from "shared";
import {
  ISourceAcce,
  ISourceAcceUai,
  ISourceAcceUaiFille,
  ISourceAcceUaiMere,
  ISourceAcceUaiSpec,
  ISourceAcceUaiZone,
} from "shared/models/source/acce/source.acce.model";
import { ISourceAcceQuerystring } from "shared/routes/experimental/source/acce.routes";

import type { Server } from "@/server/server.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";
import { createResponseStream } from "@/utils/streamUtils.js";

async function getCursor<T extends ISourceAcce>(
  source: T["source"],
  query: ISourceAcceQuerystring
): Promise<AbstractCursor<T["data"]> | null> {
  const lastImport = await getDbCollection("import.meta").findOne(
    {
      type: "acce",
    },
    { sort: { import_date: -1 } }
  );

  if (!lastImport) {
    return null;
  }

  const pipeline: Document[] = [];

  const match: Filter<ISourceAcce> = {
    source,
    date: lastImport.import_date,
  };
  if (query.uai) {
    if (source === "ACCE_UAI_MERE.csv" || source === "ACCE_UAI_FILLE.csv") {
      match["data.numero_uai_trouve"] = query.uai;
    } else {
      match["data.numero_uai"] = query.uai;
    }
  }

  pipeline.push({ $match: match });

  if (query.skip || query.limit) {
    if (source === "ACCE_UAI_MERE.csv" || source === "ACCE_UAI_FILLE.csv") {
      pipeline.push({ $sort: { "data.numero_uai_trouve": 1 } });
    } else {
      pipeline.push({ $sort: { "data.numero_uai": 1 } });
    }
  }

  if (query.skip) {
    pipeline.push({ $skip: query.skip });
  }

  if (query.limit) {
    pipeline.push({ $limit: query.limit });
  }

  pipeline.push({ $replaceRoot: { newRoot: "$data" } });

  return getDbCollection("source.acce").aggregate<T["data"]>(pipeline);
}

export const sourceAcceRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/experimental/source/acce",
    {
      schema: zRoutes.get["/experimental/source/acce"],
      onRequest: [server.auth(zRoutes.get["/experimental/source/acce"])],
    },
    async (request, response) => {
      const cursor = await getCursor<ISourceAcceUai>("ACCE_UAI.csv", request.query);

      if (!cursor) {
        return response.status(200).send([]);
      }

      return response
        .status(200)
        .header("Content-Type", "application/json")
        .send(createResponseStream(cursor, zRoutes.get["/experimental/source/acce"].response["200"]));
    }
  );

  server.get(
    "/experimental/source/acce/zone",
    {
      schema: zRoutes.get["/experimental/source/acce/zone"],
      onRequest: [server.auth(zRoutes.get["/experimental/source/acce/zone"])],
    },
    async (request, response) => {
      const cursor = await getCursor<ISourceAcceUaiZone>("ACCE_UAI_ZONE.csv", request.query);

      if (!cursor) {
        return response.status(200).send([]);
      }

      return response
        .status(200)
        .header("Content-Type", "application/json")
        .send(createResponseStream(cursor, zRoutes.get["/experimental/source/acce/zone"].response["200"]));
    }
  );

  server.get(
    "/experimental/source/acce/specialite",
    {
      schema: zRoutes.get["/experimental/source/acce/specialite"],
      onRequest: [server.auth(zRoutes.get["/experimental/source/acce/specialite"])],
    },
    async (request, response) => {
      const cursor = await getCursor<ISourceAcceUaiSpec>("ACCE_UAI_SPEC.csv", request.query);

      if (!cursor) {
        return response.status(200).send([]);
      }

      return response
        .status(200)
        .header("Content-Type", "application/json")
        .send(createResponseStream(cursor, zRoutes.get["/experimental/source/acce/specialite"].response["200"]));
    }
  );

  server.get(
    "/experimental/source/acce/mere",
    {
      schema: zRoutes.get["/experimental/source/acce/mere"],
      onRequest: [server.auth(zRoutes.get["/experimental/source/acce/mere"])],
    },
    async (request, response) => {
      const cursor = await getCursor<ISourceAcceUaiMere>("ACCE_UAI_MERE.csv", request.query);

      if (!cursor) {
        return response.status(200).send([]);
      }

      return response
        .status(200)
        .header("Content-Type", "application/json")
        .send(createResponseStream(cursor, zRoutes.get["/experimental/source/acce/mere"].response["200"]));
    }
  );

  server.get(
    "/experimental/source/acce/fille",
    {
      schema: zRoutes.get["/experimental/source/acce/fille"],
      onRequest: [server.auth(zRoutes.get["/experimental/source/acce/fille"])],
    },
    async (request, response) => {
      const cursor = await getCursor<ISourceAcceUaiFille>("ACCE_UAI_FILLE.csv", request.query);

      if (!cursor) {
        return response.status(200).send([]);
      }

      return response
        .status(200)
        .header("Content-Type", "application/json")
        .send(createResponseStream(cursor, zRoutes.get["/experimental/source/acce/fille"].response["200"]));
    }
  );
};
