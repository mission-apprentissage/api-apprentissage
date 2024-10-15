import type { ICommune } from "api-alternance-sdk";
import { zRoutes } from "shared";

import type { Server } from "@/server/server.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

type IDepartementAggDatum = {
  codeInsee: ICommune["departement"]["codeInsee"];
  nom: ICommune["departement"]["nom"];
  region: ICommune["region"];
  academie: ICommune["academie"];
};

export const geographieRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/geographie/v1/commune/search",
    {
      schema: zRoutes.get["/geographie/v1/commune/search"],
      onRequest: [server.auth(zRoutes.get["/geographie/v1/commune/search"])],
    },
    async (request, response) => {
      const { code } = request.query;
      const communes = await getDbCollection("commune")
        .find({ $or: [{ "code.insee": code }, { "code.postaux": code }] })
        .toArray();

      return response.send(communes);
    }
  );

  server.get(
    "/geographie/v1/departement",
    {
      schema: zRoutes.get["/geographie/v1/departement"],
      onRequest: [server.auth(zRoutes.get["/geographie/v1/departement"])],
    },
    async (_request, response) => {
      const data = await getDbCollection("commune")
        .aggregate<IDepartementAggDatum>([
          {
            $sort: {
              "departement.codeInsee": 1,
            },
          },
          {
            $group: {
              _id: "$departement.codeInsee",
              nom: { $first: "$departement.nom" },
              region: {
                $first: "$region",
              },
              academie: {
                $first: "$academie",
              },
            },
          },
          {
            $project: {
              _id: 0,
              codeInsee: "$_id",
              nom: 1,
              region: 1,
              academie: 1,
            },
          },
        ])
        .toArray();

      return response.send(data);
    }
  );
};
