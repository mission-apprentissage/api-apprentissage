import { notFound } from "@hapi/boom";
import type { ObjectId } from "mongodb";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export async function deleteOrganisation(organisationIdToDelete: ObjectId) {
  const organisation = await getDbCollection("organisations").findOne(
    { _id: organisationIdToDelete },
    { projection: { nom: 1 } }
  );
  if (!organisation?.nom) throw notFound();
  await removeOrganisationFromUsers(organisation.nom);
  await getDbCollection("organisations").deleteOne({ _id: organisationIdToDelete });
}

function removeOrganisationFromUsers(organisationName: string) {
  return getDbCollection("users").updateMany(
    { organisation: organisationName },
    { $set: { organisation: null, updated_at: new Date() } }
  );
}
