import { internal } from "@hapi/boom";
import { zRoutes } from "shared";
import { IImportMetaNpec } from "shared/models/import.meta.model";
import { ISourceNpecNormalized } from "shared/models/source/npec/source.npec.normalized.model";

import { Server } from "@/server/server.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const simulateurRoutes = ({ server }: { server: Server }) => {
  server.get(
    "/_private/simulateur/context",
    {
      schema: zRoutes.get["/_private/simulateur/context"],
    },
    async (_request, response) => {
      const [
        rncps,
        conventions_collectives_kali,
        conventions_collectives_dares,
        conventions_collectives_dares_ape_idcc,
      ] = await Promise.all([
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
        getDbCollection("source.dares.ccn")
          .aggregate<{ idcc: number; titre: string }>([
            {
              $sort: { "data.idcc": 1, date_import: -1, "data.titre": 1 },
            },
            {
              $group: { _id: "$data.idcc", titre: { $first: "$data.titre" } },
            },
            { $project: { _id: 0, idcc: "$_id", titre: 1 } },
          ])
          .toArray(),
        getDbCollection("source.dares.ape_idcc")
          .aggregate<{ idcc: number; titre: string }>([
            {
              $match: { "data.convention_collective.idcc": { $ne: null } },
            },
            {
              $sort: { "data.convention_collective.idcc": 1, date_import: -1, "data.convention_collective.titre": 1 },
            },
            {
              $group: {
                _id: "$data.convention_collective.idcc",
                titre: { $first: "$data.convention_collective.titre" },
              },
            },
            { $project: { _id: 0, idcc: "$_id", titre: 1 } },
          ])
          .toArray(),
      ]);

      const seen = new Set();
      const conventions_collectives = [];

      // Merge conventions collectives from KALI and DARES
      // Kali is the reference source, DARES is a fallback
      for (const list of [
        conventions_collectives_kali,
        conventions_collectives_dares,
        conventions_collectives_dares_ape_idcc,
      ]) {
        for (const item of list) {
          if (seen.has(item.idcc)) {
            continue;
          }
          conventions_collectives.push(item);
          seen.add(item.idcc);
        }
      }

      return response.status(200).send({
        rncps,
        conventions_collectives: conventions_collectives.toSorted((a, b) => a.idcc - b.idcc),
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
