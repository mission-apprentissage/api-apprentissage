import { internal } from "@hapi/boom";
import { zRoutes } from "shared";
import { IImportMetaNpec } from "shared/models/import.meta.model";
import { ISourceNpecNormalized } from "shared/models/source/npec/source.npec.normalized.model";

import { Server } from "@/server/server";
import { getDbCollection } from "@/services/mongodb/mongodbService";

export const simulateurRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/_private/simulateur/context",
    {
      schema: zRoutes.get["/_private/simulateur/context"],
    },
    async (request, response) => {
      const [rncps, conventions_collectives] = await Promise.all([
        getDbCollection("certifications")
          .aggregate<{ code: string; intitule: string }>([
            { $match: { "identifiant.rncp": { $ne: null } } },
            { $group: { _id: "$identifiant.rncp", intitule: { $first: "$intitule.rncp" } } },
            { $sort: { numero: 1 } },
            { $project: { _id: 0, code: "$_id", intitule: 1 } },
          ])
          .toArray(),
        getDbCollection("source.kali.ccn")
          .aggregate<{ idcc: number; titre: string }>([
            {
              $match: { "data.type": "IDCC" },
            },
            {
              $sort: { "data.idcc": 1, "data.debut": 1, "data.titre": 1 },
            },
            {
              $group: { _id: "$data.idcc", titre: { $first: "$data.titre" } },
            },
            { $project: { _id: 0, idcc: "$_id", titre: 1 } },
          ])
          .toArray(),
      ]);

      return response.status(200).send({
        rncps,
        conventions_collectives,
      });
    }
  );

  server.get(
    "/_private/simulateur/npec/contrat",
    {
      schema: zRoutes.get["/_private/simulateur/npec/contrat"],
    },
    async (request, response) => {
      const { rncp, idcc, date_signature } = request.query;

      const result = await getDbCollection("source.npec.normalized")
        .aggregate<ISourceNpecNormalized>([
          {
            $match: {
              rncp,
              idcc,
              date_applicabilite: { $lte: date_signature },
            },
          },
          { $sort: { date_file: -1, date_applicabilite: -1 } },
          { $limit: 1 },
        ])
        .toArray();

      const npec = result[0] ?? null;
      if (npec === null) {
        return response.status(200).send(null);
      }

      const importMeta = await getDbCollection("import.meta").findOne<IImportMetaNpec>({ _id: npec.import_id });

      if (importMeta === null) {
        throw internal("Import meta not found", { npec });
      }

      return response.status(200).send({
        npec: npec,
        metadata: {
          title: importMeta.title,
          description: importMeta.description,
          resource: importMeta.resource,
        },
      });
    }
  );
};
