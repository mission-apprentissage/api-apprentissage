import { internal } from "@hapi/boom";
import { ObjectId } from "mongodb";
import { zSourceReferentiel } from "shared/models/source/referentiel/source.referentiel.model";

import { fetchReferentielOrganismes } from "@/services/apis/referentiel/referentiel.js";
import { withCause } from "@/services/errors/withCause.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export async function runReferentielImporter() {
  const importDate = new Date();

  const importId = new ObjectId();

  try {
    await getDbCollection("import.meta").insertOne({
      _id: importId,
      import_date: importDate,
      type: "referentiel",
      status: "pending",
    });

    const organismes = await fetchReferentielOrganismes();

    const toInsert = organismes.map((data) =>
      zSourceReferentiel.parse({
        _id: new ObjectId(),
        date: importDate,
        data,
      })
    );

    await getDbCollection("source.referentiel").insertMany(toInsert);

    await getDbCollection("source.referentiel").deleteMany({
      date: { $ne: importDate },
    });

    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "done" } });
  } catch (error) {
    await getDbCollection("import.meta").updateOne({ _id: importId }, { $set: { status: "failed" } });
    throw withCause(internal("import.referentiel: unable to runReferentielImporter"), error, "fatal");
  }
}
