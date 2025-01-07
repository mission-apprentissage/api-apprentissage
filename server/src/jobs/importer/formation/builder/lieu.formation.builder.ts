import { internal } from "@hapi/boom";
import type { ICommune, IFormation } from "api-alternance-sdk";
import { zSiret } from "api-alternance-sdk";
import { LRUCache } from "lru-cache";
import type { IFormationCatalogue } from "shared/models/source/catalogue/source.catalogue.model";

import { getDbCollection } from "@/services/mongodb/mongodbService.js";

const cache = new LRUCache<string, ICommune>({
  max: 5_000,
  ttl: 60 * 60_000,
});

async function getCommune(code_insee: string): Promise<ICommune | null> {
  if (cache.has(code_insee)) {
    return cache.get(code_insee)!;
  }

  const commune = await getDbCollection("commune").findOne({
    $or: [{ "code.insee": code_insee }, { "arrondissements.code": code_insee }, { "anciennes.codeInsee": code_insee }],
  });

  if (commune) {
    cache.set(code_insee, commune);
    return commune;
  }

  const byCp = await getDbCollection("commune").findOne({ "code.postaux": code_insee });

  if (byCp) {
    cache.set(code_insee, byCp);
    return byCp;
  }

  return null;
}

function parseGeoCoordinates(geo: string | null): { lat: number; long: number } | null {
  if (!geo) {
    return null;
  }

  const [lat, long] = geo.split(",").map(Number);

  if (isNaN(lat) || isNaN(long)) {
    return null;
  }

  return { lat, long };
}

export async function buildFormationLieu(
  data: Pick<
    IFormationCatalogue,
    | "code_commune_insee"
    | "lieu_formation_geo_coordonnees"
    | "lieu_formation_geo_coordonnees_computed"
    | "lieu_formation_adresse"
    | "code_postal"
    | "distance"
    | "lieu_formation_siret"
  >
): Promise<IFormation["lieu"]> {
  let commune = await getCommune(data.code_commune_insee);

  if (!commune) {
    commune = await getCommune(data.code_postal);

    if (!commune) {
      throw internal(`buildFormationLieu: commune not found`, {
        code_commune_insee: data.code_commune_insee,
        code_postal: data.code_postal,
      });
    }
  }

  const coords =
    parseGeoCoordinates(data.lieu_formation_geo_coordonnees) ??
    parseGeoCoordinates(data.lieu_formation_geo_coordonnees_computed);

  if (coords === null) {
    throw internal(`buildFormationLieu: invalid geo coordinates`, {
      lieu_formation_geo_coordonnees: data.lieu_formation_geo_coordonnees,
      lieu_formation_geo_coordonnees_computed: data.lieu_formation_geo_coordonnees_computed,
    });
  }

  const siretParse = zSiret.safeParse(data.lieu_formation_siret);

  return {
    adresse: {
      label: data.lieu_formation_adresse,
      code_postal: data.code_postal,

      commune: {
        nom: commune.nom,
        code_insee: commune.code.insee,
      },
      departement: {
        nom: commune.departement.nom,
        code_insee: commune.departement.codeInsee,
      },
      region: {
        code_insee: commune.region.codeInsee,
        nom: commune.region.nom,
      },
      academie: {
        id: commune.academie.id,
        code: commune.academie.code,
        nom: commune.academie.nom,
      },
    },

    geolocalisation: {
      type: "Point",
      coordinates: [coords.long, coords.lat],
    },

    precision: data.distance,

    siret: siretParse.success ? siretParse.data : null,
  };
}
