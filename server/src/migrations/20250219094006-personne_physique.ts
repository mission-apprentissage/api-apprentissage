import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("cache.entreprise").deleteMany({
    "data.type": "etablissement",
    "data.etablissement.unite_legale.type": "personne_physique",
  });
  await getDbCollection("cache.entreprise").deleteMany({
    "data.type": "unite_legale",
    "data.unite_legale.type": "personne_physique",
  });
};

export const requireShutdown: boolean = true;
