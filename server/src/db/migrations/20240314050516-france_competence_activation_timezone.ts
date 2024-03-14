import { Db, MongoClient } from "mongodb";
import { IImportMetaFranceCompetence } from "shared/models/import.meta.model";
import { parisTimezoneDate } from "shared/zod/date.primitives";

import { getDbCollection, setMongodbClient } from "../../common/utils/mongodbUtils";

export const up = async (_db: Db, client: MongoClient) => {
  setMongodbClient(client);
  const cursor = getDbCollection("import.meta").find<IImportMetaFranceCompetence>({ type: "france_competence" });
  for await (const importMeta of cursor) {
    const datePublication = parisTimezoneDate({
      year: importMeta.archiveMeta.date_publication.getUTCFullYear(),
      month: importMeta.archiveMeta.date_publication.getUTCMonth() + 1,
      day: importMeta.archiveMeta.date_publication.getUTCDate(),
      hour: 0,
      minute: 0,
      second: 0,
    });

    if (importMeta.archiveMeta.date_publication.getTime() === datePublication.getTime()) {
      continue;
    }

    await getDbCollection("import.meta").updateOne(
      { _id: importMeta._id },
      { $set: { "archiveMeta.date_publication": datePublication } }
    );

    await getDbCollection("source.france_competence").updateMany(
      { date_premiere_activation: importMeta.archiveMeta.date_publication },
      { $set: { date_premiere_activation: datePublication } }
    );

    await getDbCollection("source.france_competence").updateMany(
      { date_derniere_activation: importMeta.archiveMeta.date_publication },
      { $set: { date_derniere_activation: datePublication } }
    );

    await getDbCollection("source.france_competence").updateMany(
      { date_premiere_publication: importMeta.archiveMeta.date_publication },
      { $set: { date_premiere_publication: datePublication } }
    );
    await getDbCollection("source.france_competence").updateMany(
      { date_derniere_publication: importMeta.archiveMeta.date_publication },
      { $set: { date_derniere_publication: datePublication } }
    );
  }
};
