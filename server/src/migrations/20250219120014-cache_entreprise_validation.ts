import { getDbCollection } from "@/services/mongodb/mongodbService.js";

export const up = async () => {
  await getDbCollection("cache.entreprise").updateMany(
    {
      "data.type": "unite_legale",
      "data.unite_legale.personne_physique_attributs.nom_naissance": null,
    },
    {
      $set: {
        "data.unite_legale.personne_physique_attributs.nom_naissance": null,
      },
    }
  );
  await getDbCollection("cache.entreprise").updateMany(
    {
      "data.type": "etablissement",
      "data.etablissement.unite_legale.personne_physique_attributs.nom_naissance": null,
    },
    {
      $set: {
        "data.etablissement.unite_legale.personne_physique_attributs.nom_naissance": null,
      },
    }
  );
};

export const requireShutdown: boolean = true;
