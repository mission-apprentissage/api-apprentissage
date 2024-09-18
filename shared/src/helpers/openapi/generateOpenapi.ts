import { registerOpenApiCertificationSchema, registerOpenApiErrorsSchema } from "api-alternance-sdk/internal";
import { OpenApiBuilder } from "openapi3-ts/oas31";

export function generateOpenApiSchema(version: string, env: string, publicUrl: string) {
  const builder = new OpenApiBuilder();

  builder
    .addInfo({
      title: "Documentation technique de l'API Apprentissage",
      version,
      license: {
        name: "Etalab-2.0",
        url: "https://github.com/etalab/licence-ouverte/blob/master/LO.md",
      },
      termsOfService: "https://api.apprentissage.beta.gouv.fr/cgu",
      contact: {
        name: "Équipe API Apprentissage",
        email: "support_api@apprentissage.beta.gouv.fr",
      },
    })
    .addServer({
      url: publicUrl,
      description: env,
    })
    .addTag({
      name: "Essayer l'API",
      description: "Pour essayer l'API [vous pouvez utiliser le swagger UI](/documentation-technique/try)",
    })
    .addTag({
      name: "Certifications",
      description: "Liste des opérations sur les certifications.",
    })
    .addTag({
      name: "Expérimental",
      description: "Liste des routes expérimentales. Attention: ces routes peuvent changer sans préavis.",
    })
    .addSecurityScheme("api-key", {
      type: "http",
      scheme: "bearer",
      bearerFormat: "Bearer",
      description: "Clé d'API à fournir dans le header `Authorization`.",
    });

  registerOpenApiCertificationSchema(builder);
  registerOpenApiErrorsSchema(builder);

  const errorResponses = {
    "400": {
      description: "Paramètre de requête non valide.",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/BadRequest",
          },
        },
      },
    },
    "401": {
      description: "Clé d’API manquante ou invalide",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Unauthorized",
          },
        },
      },
    },
    "403": {
      description: "Habilitations insuffisantes pour accéder à la ressource",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/Forbidden",
          },
        },
      },
    },
    "404": {
      description: "Resource non trouvée",
      content: {
        "application/json": {
          schema: {
            $ref: "#/components/schemas/NotFound",
          },
        },
      },
      "429": {
        description: "Limite de volumétrie atteinte pour la clé d’API",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/TooManyRequests",
            },
          },
        },
      },
      "500": {
        description: "Une erreur inattendue s'est produite sur le serveur.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/InternalServerError",
            },
          },
        },
      },
      "502": {
        description: "Le service est indisponible.",
        content: {
          "application/json": {
            schema: {
              $ref: "#/components/schemas/BadGateway",
            },
          },
        },
        "503": {
          description: "Le service est en maintenance",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ServiceUnavailable",
              },
            },
          },
        },
      },
    },
  } as const;

  builder.addPath("/healthcheck", {
    get: {
      tags: ["Système"],
      security: [],
      responses: {
        "200": {
          description: "Statut de l'application",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "api" },
                  version: { type: "string", example: "1.0.0" },
                  env: {
                    type: "string",
                    enum: ["local", "recette", "production", "preview", "test"],
                  },
                },
                required: ["name", "version", "env"],
                additionalProperties: false,
                description: "Statut de l'application",
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });

  builder.addPath("/certification/v1", {
    get: {
      tags: ["Certifications"],
      summary: "Récupération des certifications",
      description: "Récupère la liste des certifications, filtrée par `identifiant.cfd` et `identifiant.rncp`",
      operationId: "getCertifications",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: {
            type: "string",
            pattern: "^([A-Z0-9]{3}\\d{3}[A-Z0-9]{2}|null)?$",
            examples: ["46X32402", "", "null"],
          },
          required: false,
          description:
            "Filtre la liste des certifications par `identifiant.cfd`\n\n- Si la valeur est vide ou `null`, filtre avec `identifiant.cfd = null`\n\n- Si la valeur est absente, aucun filtre n'est appliqué\n\n- Sinon doit respecter le regex `/^[A-Z0-9]{3}\\d{3}[A-Z0-9]{2}$/`",
          allowEmptyValue: true,
          name: "identifiant.cfd",
          in: "query",
        },
        {
          schema: {
            type: "string",
            pattern: "^(RNCP\\d{3,5}|null)?$",
            examples: ["RNCP12345", "", "null"],
          },
          required: false,
          description:
            "Filtre la liste des certifications par `identifiant.rncp`\n\n- Si la valeur est vide ou `null`, filtre avec `identifiant.rncp = null`\n\n- Si la valeur est absente, aucun filtre n'est appliqué\n\n- Sinon doit respecter le regex `/^RNCP\\d{3,5}$/`",
          allowEmptyValue: true,
          name: "identifiant.rncp",
          in: "query",
        },
      ],
      responses: {
        "200": {
          description: "Liste des certifications",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Certification",
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });

  builder.addPath("/experimental/source/acce", {
    get: {
      tags: ["Expérimental"],
      summary: "Source Base ACCE: Établissements",
      description: "Liste des établissements importés depuis la base ACCE. Attention: cette route est expérimentale.",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: { type: "string" },
          required: false,
          name: "uai",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          },
          required: false,
          description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          name: "limit",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, ignore les N premiers résultats.",
          },
          required: false,
          description: "Si renseigné, ignore les N premiers résultats.",
          name: "skip",
          in: "query",
        },
      ],
      responses: {
        "200": {
          description: "",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nature_uai: { type: "string", pattern: "^\\d{3}$" },
                    nature_uai_libe: { type: "string" },
                    type_uai: { type: "string" },
                    type_uai_libe: { type: "string" },
                    etat_etablissement: {
                      type: "string",
                      enum: ["1", "2", "3", "4"],
                    },
                    etat_etablissement_libe: {
                      type: "string",
                      enum: ["Ouvert", "À fermer", "À ouvrir", "Fermé"],
                    },
                    ministere_tutelle: {
                      type: "string",
                      pattern: "^\\d{2}$",
                    },
                    ministere_tutelle_libe: { type: "string" },
                    tutelle_2: {
                      type: ["string", "null"],
                      pattern: "^\\d{2}$",
                    },
                    tutelle_2_libe: { type: ["string", "null"] },
                    secteur_public_prive: {
                      type: "string",
                      enum: ["PR", "PU"],
                    },
                    secteur_public_prive_libe: {
                      type: "string",
                      enum: ["Privé", "Public"],
                    },
                    sigle_uai: { type: ["string", "null"] },
                    categorie_juridique: { type: "string" },
                    categorie_juridique_libe: { type: "string" },
                    contrat_etablissement: {
                      type: "string",
                      enum: ["99", "10", "30", "20", "50", "31", "21", "!!", "40", "41", "60"],
                    },
                    contrat_etablissement_libe: {
                      type: "string",
                      enum: [
                        "Sans objet",
                        "Hors contrat",
                        "Contrat d'association pour toutes les classes",
                        "Contrat simple pour toutes les classes",
                        "Reconnu par l'Etat",
                        "Contrat d'association pour une partie des classes",
                        "Contrat simple pour une partie des classes",
                        "Inconnu du gestionnaire",
                        "Contrats simple et d'association pour toutes les classes",
                        "Contrats simple et d'association pour une partie des classes",
                        "Sous contrat établissement agricole",
                      ],
                    },
                    categorie_financiere: { type: ["string", "null"] },
                    categorie_financiere_libe: {
                      type: ["string", "null"],
                    },
                    situation_comptable: { type: "string" },
                    situation_comptable_libe: { type: "string" },
                    niveau_uai: {
                      type: "string",
                      enum: ["1", "3", "2", "4"],
                    },
                    niveau_uai_libe: {
                      type: "string",
                      enum: ["UAI célibataire", "UAI fille", "UAI mère", "UAI mère et fille"],
                    },
                    commune: { type: "string" },
                    commune_libe: { type: ["string", "null"] },
                    academie: {
                      type: ["string", "null"],
                      pattern: "^\\d{2}$",
                    },
                    academie_libe: { type: ["string", "null"] },
                    pays: { type: "string" },
                    pays_libe: { type: "string" },
                    departement_insee_3: { type: ["string", "null"] },
                    departement_insee_3_libe: {
                      type: ["string", "null"],
                    },
                    denomination_principale: { type: ["string", "null"] },
                    appellation_officielle: { type: ["string", "null"] },
                    patronyme_uai: { type: ["string", "null"] },
                    hebergement_etablissement: { type: "string" },
                    hebergement_etablissement_libe: { type: "string" },
                    numero_siren_siret_uai: { type: ["string", "null"] },
                    numero_finess_uai: { type: ["string", "null"] },
                    date_ouverture: { type: ["string", "null"] },
                    date_fermeture: { type: ["string", "null"] },
                    date_derniere_mise_a_jour: { type: "string" },
                    lieu_dit_uai: { type: ["string", "null"] },
                    adresse_uai: { type: ["string", "null"] },
                    boite_postale_uai: { type: ["string", "null"] },
                    code_postal_uai: { type: ["string", "null"] },
                    etat_sirad_uai: { type: ["string", "null"] },
                    localite_acheminement_uai: {
                      type: ["string", "null"],
                    },
                    pays_etranger_acheminement: {
                      type: ["string", "null"],
                    },
                    numero_telephone_uai: { type: ["string", "null"] },
                    numero_telecopieur_uai: { type: ["string", "null"] },
                    mention_distribution: { type: ["string", "null"] },
                    mel_uai: { type: ["string", "null"] },
                    site_web: { type: ["string", "null"] },
                    coordonnee_x: { type: ["number", "null"] },
                    coordonnee_y: { type: ["number", "null"] },
                    appariement: { type: ["string", "null"] },
                    appariement_complement: { type: ["string", "null"] },
                    localisation: { type: ["string", "null"] },
                    localisation_complement: { type: ["string", "null"] },
                    date_geolocalisation: { type: ["string", "null"] },
                    source: { type: ["string", "null"] },
                    numero_uai: { type: "string" },
                  },
                  required: [
                    "nature_uai",
                    "nature_uai_libe",
                    "type_uai",
                    "type_uai_libe",
                    "etat_etablissement",
                    "etat_etablissement_libe",
                    "ministere_tutelle",
                    "ministere_tutelle_libe",
                    "tutelle_2",
                    "tutelle_2_libe",
                    "secteur_public_prive",
                    "secteur_public_prive_libe",
                    "sigle_uai",
                    "categorie_juridique",
                    "categorie_juridique_libe",
                    "contrat_etablissement",
                    "contrat_etablissement_libe",
                    "categorie_financiere",
                    "categorie_financiere_libe",
                    "situation_comptable",
                    "situation_comptable_libe",
                    "niveau_uai",
                    "niveau_uai_libe",
                    "commune",
                    "commune_libe",
                    "academie",
                    "academie_libe",
                    "pays",
                    "pays_libe",
                    "departement_insee_3",
                    "departement_insee_3_libe",
                    "denomination_principale",
                    "appellation_officielle",
                    "patronyme_uai",
                    "hebergement_etablissement",
                    "hebergement_etablissement_libe",
                    "numero_siren_siret_uai",
                    "numero_finess_uai",
                    "date_fermeture",
                    "date_derniere_mise_a_jour",
                    "lieu_dit_uai",
                    "adresse_uai",
                    "boite_postale_uai",
                    "code_postal_uai",
                    "etat_sirad_uai",
                    "localite_acheminement_uai",
                    "pays_etranger_acheminement",
                    "numero_telephone_uai",
                    "numero_telecopieur_uai",
                    "mention_distribution",
                    "mel_uai",
                    "site_web",
                    "coordonnee_x",
                    "coordonnee_y",
                    "appariement",
                    "appariement_complement",
                    "localisation",
                    "localisation_complement",
                    "date_geolocalisation",
                    "source",
                    "numero_uai",
                  ],
                  additionalProperties: false,
                },
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });

  builder.addPath("/experimental/source/acce/zone", {
    get: {
      tags: ["Expérimental"],
      summary: "Source Base ACCE: Zones d'établissements",
      description:
        "Liste des zones d'établissements importées depuis la base ACCE. Attention: cette route est expérimentale.",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: { type: "string" },
          required: false,
          name: "uai",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          },
          required: false,
          description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          name: "limit",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, ignore les N premiers résultats.",
          },
          required: false,
          description: "Si renseigné, ignore les N premiers résultats.",
          name: "skip",
          in: "query",
        },
      ],
      responses: {
        "200": {
          description: "",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    numero_uai: { type: "string" },
                    type_zone_uai: { type: "string" },
                    type_zone_uai_libe: { type: "string" },
                    zone: { type: "string" },
                    zone_libe: { type: "string" },
                    date_ouverture: { type: "string" },
                    date_fermeture: { type: ["string", "null"] },
                    date_derniere_mise_a_jour: {
                      type: ["string", "null"],
                    },
                  },
                  required: [
                    "numero_uai",
                    "type_zone_uai",
                    "type_zone_uai_libe",
                    "zone",
                    "zone_libe",
                    "date_ouverture",
                    "date_fermeture",
                    "date_derniere_mise_a_jour",
                  ],
                  additionalProperties: false,
                },
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });
  builder.addPath("/experimental/source/acce/specialite", {
    get: {
      tags: ["Expérimental"],
      summary: "Source Base ACCE: Spécialités d'établissements",
      description:
        "Liste des spécialités d'établissements importées depuis la base ACCE. Attention: cette route est expérimentale.",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: { type: "string" },
          required: false,
          name: "uai",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          },
          required: false,
          description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          name: "limit",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, ignore les N premiers résultats.",
          },
          required: false,
          description: "Si renseigné, ignore les N premiers résultats.",
          name: "skip",
          in: "query",
        },
      ],
      responses: {
        "200": {
          description: "",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    numero_uai: { type: "string" },
                    specificite_uai: { type: "string" },
                    specificite_uai_libe: { type: "string" },
                    date_ouverture: { type: "string" },
                    date_fermeture: { type: ["string", "null"] },
                  },
                  required: [
                    "numero_uai",
                    "specificite_uai",
                    "specificite_uai_libe",
                    "date_ouverture",
                    "date_fermeture",
                  ],
                  additionalProperties: false,
                },
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });
  builder.addPath("/experimental/source/acce/mere", {
    get: {
      tags: ["Expérimental"],
      summary: "Source Base ACCE: Établissements mères",
      description:
        "Liste des relations fille-mère d'établissements importées depuis la base ACCE. Attention: cette route est expérimentale.",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: { type: "string" },
          required: false,
          name: "uai",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          },
          required: false,
          description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          name: "limit",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, ignore les N premiers résultats.",
          },
          required: false,
          description: "Si renseigné, ignore les N premiers résultats.",
          name: "skip",
          in: "query",
        },
      ],
      responses: {
        "200": {
          description: "",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nature_uai: { type: "string", pattern: "^\\d{3}$" },
                    nature_uai_libe: { type: "string" },
                    type_uai: { type: "string" },
                    type_uai_libe: { type: "string" },
                    etat_etablissement: {
                      type: "string",
                      enum: ["1", "2", "3", "4"],
                    },
                    etat_etablissement_libe: {
                      type: "string",
                      enum: ["Ouvert", "À fermer", "À ouvrir", "Fermé"],
                    },
                    ministere_tutelle: {
                      type: "string",
                      pattern: "^\\d{2}$",
                    },
                    ministere_tutelle_libe: { type: "string" },
                    tutelle_2: {
                      type: ["string", "null"],
                      pattern: "^\\d{2}$",
                    },
                    tutelle_2_libe: { type: ["string", "null"] },
                    secteur_public_prive: {
                      type: "string",
                      enum: ["PR", "PU"],
                    },
                    secteur_public_prive_libe: {
                      type: "string",
                      enum: ["Privé", "Public"],
                    },
                    sigle_uai: { type: ["string", "null"] },
                    categorie_juridique: { type: "string" },
                    categorie_juridique_libe: { type: "string" },
                    contrat_etablissement: {
                      type: "string",
                      enum: ["99", "10", "30", "20", "50", "31", "21", "!!", "40", "41", "60"],
                    },
                    contrat_etablissement_libe: {
                      type: "string",
                      enum: [
                        "Sans objet",
                        "Hors contrat",
                        "Contrat d'association pour toutes les classes",
                        "Contrat simple pour toutes les classes",
                        "Reconnu par l'Etat",
                        "Contrat d'association pour une partie des classes",
                        "Contrat simple pour une partie des classes",
                        "Inconnu du gestionnaire",
                        "Contrats simple et d'association pour toutes les classes",
                        "Contrats simple et d'association pour une partie des classes",
                        "Sous contrat établissement agricole",
                      ],
                    },
                    categorie_financiere: { type: ["string", "null"] },
                    categorie_financiere_libe: {
                      type: ["string", "null"],
                    },
                    situation_comptable: { type: "string" },
                    situation_comptable_libe: { type: "string" },
                    niveau_uai: {
                      type: "string",
                      enum: ["1", "3", "2", "4"],
                    },
                    niveau_uai_libe: {
                      type: "string",
                      enum: ["UAI célibataire", "UAI fille", "UAI mère", "UAI mère et fille"],
                    },
                    commune: { type: "string" },
                    commune_libe: { type: ["string", "null"] },
                    academie: {
                      type: ["string", "null"],
                      pattern: "^\\d{2}$",
                    },
                    academie_libe: { type: ["string", "null"] },
                    pays: { type: "string" },
                    pays_libe: { type: "string" },
                    departement_insee_3: { type: ["string", "null"] },
                    departement_insee_3_libe: {
                      type: ["string", "null"],
                    },
                    denomination_principale: { type: ["string", "null"] },
                    appellation_officielle: { type: ["string", "null"] },
                    patronyme_uai: { type: ["string", "null"] },
                    hebergement_etablissement: { type: "string" },
                    hebergement_etablissement_libe: { type: "string" },
                    numero_siren_siret_uai: { type: ["string", "null"] },
                    numero_finess_uai: { type: ["string", "null"] },
                    date_ouverture: { type: ["string", "null"] },
                    date_fermeture: { type: ["string", "null"] },
                    date_derniere_mise_a_jour: { type: "string" },
                    lieu_dit_uai: { type: ["string", "null"] },
                    adresse_uai: { type: ["string", "null"] },
                    boite_postale_uai: { type: ["string", "null"] },
                    code_postal_uai: { type: ["string", "null"] },
                    etat_sirad_uai: { type: ["string", "null"] },
                    localite_acheminement_uai: {
                      type: ["string", "null"],
                    },
                    pays_etranger_acheminement: {
                      type: ["string", "null"],
                    },
                    numero_telephone_uai: { type: ["string", "null"] },
                    numero_telecopieur_uai: { type: ["string", "null"] },
                    mention_distribution: { type: ["string", "null"] },
                    mel_uai: { type: ["string", "null"] },
                    site_web: { type: ["string", "null"] },
                    coordonnee_x: { type: ["number", "null"] },
                    coordonnee_y: { type: ["number", "null"] },
                    appariement: { type: ["string", "null"] },
                    appariement_complement: { type: ["string", "null"] },
                    localisation: { type: ["string", "null"] },
                    localisation_complement: { type: ["string", "null"] },
                    date_geolocalisation: { type: ["string", "null"] },
                    source: { type: ["string", "null"] },
                    numero_uai_trouve: { type: "string" },
                    numero_uai_mere: { type: "string" },
                    type_rattachement: { type: "string" },
                  },
                  required: [
                    "nature_uai",
                    "nature_uai_libe",
                    "type_uai",
                    "type_uai_libe",
                    "etat_etablissement",
                    "etat_etablissement_libe",
                    "ministere_tutelle",
                    "ministere_tutelle_libe",
                    "tutelle_2",
                    "tutelle_2_libe",
                    "secteur_public_prive",
                    "secteur_public_prive_libe",
                    "sigle_uai",
                    "categorie_juridique",
                    "categorie_juridique_libe",
                    "contrat_etablissement",
                    "contrat_etablissement_libe",
                    "categorie_financiere",
                    "categorie_financiere_libe",
                    "situation_comptable",
                    "situation_comptable_libe",
                    "niveau_uai",
                    "niveau_uai_libe",
                    "commune",
                    "commune_libe",
                    "academie",
                    "academie_libe",
                    "pays",
                    "pays_libe",
                    "departement_insee_3",
                    "departement_insee_3_libe",
                    "denomination_principale",
                    "appellation_officielle",
                    "patronyme_uai",
                    "hebergement_etablissement",
                    "hebergement_etablissement_libe",
                    "numero_siren_siret_uai",
                    "numero_finess_uai",
                    "date_fermeture",
                    "date_derniere_mise_a_jour",
                    "lieu_dit_uai",
                    "adresse_uai",
                    "boite_postale_uai",
                    "code_postal_uai",
                    "etat_sirad_uai",
                    "localite_acheminement_uai",
                    "pays_etranger_acheminement",
                    "numero_telephone_uai",
                    "numero_telecopieur_uai",
                    "mention_distribution",
                    "mel_uai",
                    "site_web",
                    "coordonnee_x",
                    "coordonnee_y",
                    "appariement",
                    "appariement_complement",
                    "localisation",
                    "localisation_complement",
                    "date_geolocalisation",
                    "source",
                    "numero_uai_trouve",
                    "numero_uai_mere",
                    "type_rattachement",
                  ],
                  additionalProperties: false,
                },
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });
  builder.addPath("/experimental/source/acce/fille", {
    get: {
      tags: ["Expérimental"],
      summary: "Source Base ACCE: Établissements filles",
      description:
        "Liste des relations mère-fille d'établissements importées depuis la base ACCE. Attention: cette route est expérimentale.",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: { type: "string" },
          required: false,
          name: "uai",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          },
          required: false,
          description: "Si renseigné, limite le nombre de résultats retournés. Sinon retourne tous les résultats.",
          name: "limit",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            description: "Si renseigné, ignore les N premiers résultats.",
          },
          required: false,
          description: "Si renseigné, ignore les N premiers résultats.",
          name: "skip",
          in: "query",
        },
      ],
      responses: {
        "200": {
          description: "",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    nature_uai: { type: "string", pattern: "^\\d{3}$" },
                    nature_uai_libe: { type: "string" },
                    type_uai: { type: "string" },
                    type_uai_libe: { type: "string" },
                    etat_etablissement: {
                      type: "string",
                      enum: ["1", "2", "3", "4"],
                    },
                    etat_etablissement_libe: {
                      type: "string",
                      enum: ["Ouvert", "À fermer", "À ouvrir", "Fermé"],
                    },
                    ministere_tutelle: {
                      type: "string",
                      pattern: "^\\d{2}$",
                    },
                    ministere_tutelle_libe: { type: "string" },
                    tutelle_2: {
                      type: ["string", "null"],
                      pattern: "^\\d{2}$",
                    },
                    tutelle_2_libe: { type: ["string", "null"] },
                    secteur_public_prive: {
                      type: "string",
                      enum: ["PR", "PU"],
                    },
                    secteur_public_prive_libe: {
                      type: "string",
                      enum: ["Privé", "Public"],
                    },
                    sigle_uai: { type: ["string", "null"] },
                    categorie_juridique: { type: "string" },
                    categorie_juridique_libe: { type: "string" },
                    contrat_etablissement: {
                      type: "string",
                      enum: ["99", "10", "30", "20", "50", "31", "21", "!!", "40", "41", "60"],
                    },
                    contrat_etablissement_libe: {
                      type: "string",
                      enum: [
                        "Sans objet",
                        "Hors contrat",
                        "Contrat d'association pour toutes les classes",
                        "Contrat simple pour toutes les classes",
                        "Reconnu par l'Etat",
                        "Contrat d'association pour une partie des classes",
                        "Contrat simple pour une partie des classes",
                        "Inconnu du gestionnaire",
                        "Contrats simple et d'association pour toutes les classes",
                        "Contrats simple et d'association pour une partie des classes",
                        "Sous contrat établissement agricole",
                      ],
                    },
                    categorie_financiere: { type: ["string", "null"] },
                    categorie_financiere_libe: {
                      type: ["string", "null"],
                    },
                    situation_comptable: { type: "string" },
                    situation_comptable_libe: { type: "string" },
                    niveau_uai: {
                      type: "string",
                      enum: ["1", "3", "2", "4"],
                    },
                    niveau_uai_libe: {
                      type: "string",
                      enum: ["UAI célibataire", "UAI fille", "UAI mère", "UAI mère et fille"],
                    },
                    commune: { type: "string" },
                    commune_libe: { type: ["string", "null"] },
                    academie: {
                      type: ["string", "null"],
                      pattern: "^\\d{2}$",
                    },
                    academie_libe: { type: ["string", "null"] },
                    pays: { type: "string" },
                    pays_libe: { type: "string" },
                    departement_insee_3: { type: ["string", "null"] },
                    departement_insee_3_libe: {
                      type: ["string", "null"],
                    },
                    denomination_principale: { type: ["string", "null"] },
                    appellation_officielle: { type: ["string", "null"] },
                    patronyme_uai: { type: ["string", "null"] },
                    hebergement_etablissement: { type: "string" },
                    hebergement_etablissement_libe: { type: "string" },
                    numero_siren_siret_uai: { type: ["string", "null"] },
                    numero_finess_uai: { type: ["string", "null"] },
                    date_ouverture: { type: ["string", "null"] },
                    date_fermeture: { type: ["string", "null"] },
                    date_derniere_mise_a_jour: { type: "string" },
                    lieu_dit_uai: { type: ["string", "null"] },
                    adresse_uai: { type: ["string", "null"] },
                    boite_postale_uai: { type: ["string", "null"] },
                    code_postal_uai: { type: ["string", "null"] },
                    etat_sirad_uai: { type: ["string", "null"] },
                    localite_acheminement_uai: {
                      type: ["string", "null"],
                    },
                    pays_etranger_acheminement: {
                      type: ["string", "null"],
                    },
                    numero_telephone_uai: { type: ["string", "null"] },
                    numero_telecopieur_uai: { type: ["string", "null"] },
                    mention_distribution: { type: ["string", "null"] },
                    mel_uai: { type: ["string", "null"] },
                    site_web: { type: ["string", "null"] },
                    coordonnee_x: { type: ["number", "null"] },
                    coordonnee_y: { type: ["number", "null"] },
                    appariement: { type: ["string", "null"] },
                    appariement_complement: { type: ["string", "null"] },
                    localisation: { type: ["string", "null"] },
                    localisation_complement: { type: ["string", "null"] },
                    date_geolocalisation: { type: ["string", "null"] },
                    source: { type: ["string", "null"] },
                    numero_uai_trouve: { type: "string" },
                    numero_uai_fille: { type: "string" },
                    type_rattachement: { type: "string" },
                  },
                  required: [
                    "nature_uai",
                    "nature_uai_libe",
                    "type_uai",
                    "type_uai_libe",
                    "etat_etablissement",
                    "etat_etablissement_libe",
                    "ministere_tutelle",
                    "ministere_tutelle_libe",
                    "tutelle_2",
                    "tutelle_2_libe",
                    "secteur_public_prive",
                    "secteur_public_prive_libe",
                    "sigle_uai",
                    "categorie_juridique",
                    "categorie_juridique_libe",
                    "contrat_etablissement",
                    "contrat_etablissement_libe",
                    "categorie_financiere",
                    "categorie_financiere_libe",
                    "situation_comptable",
                    "situation_comptable_libe",
                    "niveau_uai",
                    "niveau_uai_libe",
                    "commune",
                    "commune_libe",
                    "academie",
                    "academie_libe",
                    "pays",
                    "pays_libe",
                    "departement_insee_3",
                    "departement_insee_3_libe",
                    "denomination_principale",
                    "appellation_officielle",
                    "patronyme_uai",
                    "hebergement_etablissement",
                    "hebergement_etablissement_libe",
                    "numero_siren_siret_uai",
                    "numero_finess_uai",
                    "date_fermeture",
                    "date_derniere_mise_a_jour",
                    "lieu_dit_uai",
                    "adresse_uai",
                    "boite_postale_uai",
                    "code_postal_uai",
                    "etat_sirad_uai",
                    "localite_acheminement_uai",
                    "pays_etranger_acheminement",
                    "numero_telephone_uai",
                    "numero_telecopieur_uai",
                    "mention_distribution",
                    "mel_uai",
                    "site_web",
                    "coordonnee_x",
                    "coordonnee_y",
                    "appariement",
                    "appariement_complement",
                    "localisation",
                    "localisation_complement",
                    "date_geolocalisation",
                    "source",
                    "numero_uai_trouve",
                    "numero_uai_fille",
                    "type_rattachement",
                  ],
                  additionalProperties: false,
                },
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });
  builder.addPath("/organisme/v1/recherche", {
    get: {
      tags: ["Organismes"],
      summary: "Recherche d'organismes par UAI et/ou SIRET",
      description: "Récupère la liste des organismes, filtrée par UAI et/ou SIRET fournis",
      operationId: "searchOrganismes",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: {
            type: ["string", "null"],
            pattern: "^\\d{1,7}[A-Z]$",
          },
          required: false,
          name: "uai",
          in: "query",
        },
        {
          schema: { type: ["string", "null"], pattern: "^\\d{9,14}$" },
          required: false,
          name: "siret",
          in: "query",
        },
      ],
      responses: {
        "200": {
          description: "",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  metadata: {
                    type: "object",
                    properties: {
                      uai: {
                        type: ["object", "null"],
                        properties: {
                          status: {
                            type: "string",
                            enum: ["inconnu", "ok"],
                          },
                        },
                        required: ["status"],
                      },
                      siret: {
                        type: ["object", "null"],
                        properties: {
                          status: {
                            type: "string",
                            enum: ["inconnu", "fermé", "ok"],
                          },
                        },
                        required: ["status"],
                      },
                    },
                    required: ["uai", "siret"],
                  },
                  resultat: {
                    type: ["object", "null"],
                    properties: {
                      status: {
                        type: "object",
                        properties: {
                          ouvert: { type: "boolean" },
                          declaration_catalogue: { type: "boolean" },
                          validation_uai: { type: "boolean" },
                        },
                        required: ["ouvert", "declaration_catalogue", "validation_uai"],
                      },
                      correspondances: {
                        type: "object",
                        properties: {
                          uai: {
                            type: ["object", "null"],
                            properties: {
                              lui_meme: { type: "boolean" },
                              son_lieu: { type: "boolean" },
                            },
                            required: ["lui_meme", "son_lieu"],
                          },
                          siret: {
                            type: ["object", "null"],
                            properties: {
                              son_formateur: { type: "boolean" },
                              son_responsable: { type: "boolean" },
                              lui_meme: { type: "boolean" },
                            },
                            required: ["son_formateur", "son_responsable", "lui_meme"],
                          },
                        },
                        required: ["uai", "siret"],
                      },
                      organisme: {
                        type: "object",
                        properties: {
                          identifiant: {
                            type: "object",
                            properties: {
                              uai: {
                                type: ["string", "null"],
                                pattern: "^\\d{1,7}[A-Z]$",
                              },
                              siret: {
                                type: "string",
                                pattern: "^\\d{9,14}$",
                              },
                            },
                            required: ["uai", "siret"],
                          },
                        },
                        required: ["identifiant"],
                      },
                    },
                    required: ["status", "correspondances", "organisme"],
                  },
                  candidats: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        status: {
                          type: "object",
                          properties: {
                            ouvert: { type: "boolean" },
                            declaration_catalogue: { type: "boolean" },
                            validation_uai: { type: "boolean" },
                          },
                          required: ["ouvert", "declaration_catalogue", "validation_uai"],
                        },
                        correspondances: {
                          type: "object",
                          properties: {
                            uai: {
                              type: ["object", "null"],
                              properties: {
                                lui_meme: { type: "boolean" },
                                son_lieu: { type: "boolean" },
                              },
                              required: ["lui_meme", "son_lieu"],
                            },
                            siret: {
                              type: ["object", "null"],
                              properties: {
                                son_formateur: { type: "boolean" },
                                son_responsable: { type: "boolean" },
                                lui_meme: { type: "boolean" },
                              },
                              required: ["son_formateur", "son_responsable", "lui_meme"],
                            },
                          },
                          required: ["uai", "siret"],
                        },
                        organisme: {
                          type: "object",
                          properties: {
                            identifiant: {
                              type: "object",
                              properties: {
                                uai: {
                                  type: ["string", "null"],
                                  pattern: "^\\d{1,7}[A-Z]$",
                                },
                                siret: {
                                  type: "string",
                                  pattern: "^\\d{9,14}$",
                                },
                              },
                              required: ["uai", "siret"],
                            },
                          },
                          required: ["identifiant"],
                        },
                      },
                      required: ["status", "correspondances", "organisme"],
                    },
                  },
                },
                required: ["metadata", "resultat", "candidats"],
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });
  builder.addPath("/job/v1/search", {
    get: {
      tags: ["Job"],
      summary: "Opportunités d’emploi en alternance",
      description:
        "Accédez en temps réel à l'ensemble des opportunités d'emploi en alternance disponibles sur le territoire français et exposez les gratuitement et en marque blanche auprès de vos utilisateurs.",
      operationId: "searchJobs",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: {
            type: ["number", "null"],
            minimum: -180,
            maximum: 180,
          },
          required: false,
          name: "longitude",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            minimum: -90,
            maximum: 90,
          },
          required: false,
          name: "latitude",
          in: "query",
        },
        {
          schema: {
            type: ["number", "null"],
            minimum: 0,
            maximum: 200,
            default: 30,
          },
          required: false,
          name: "radius",
          in: "query",
        },
        {
          schema: { type: "string", enum: ["3", "4", "5", "6", "7"] },
          required: false,
          name: "target_diploma_level",
          in: "query",
        },
        {
          schema: { type: "string" },
          required: false,
          name: "romes",
          in: "query",
        },
        {
          schema: { type: "string", pattern: "^RNCP\\d{3,5}$" },
          required: false,
          name: "rncp",
          in: "query",
        },
      ],
      responses: {
        "200": {
          description: "",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  jobs: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        identifier: {
                          type: "object",
                          properties: {
                            partner_job_id: { type: ["string", "null"] },
                            id: { type: ["string", "null"] },
                            partner_label: { type: "string" },
                          },
                          required: ["partner_job_id", "id", "partner_label"],
                        },
                        workplace: {
                          type: "object",
                          properties: {
                            name: {
                              type: ["string", "null"],
                              description: "Nom customisé de l'entreprise",
                            },
                            description: {
                              type: ["string", "null"],
                              description: "description de l'entreprise",
                            },
                            website: {
                              type: ["string", "null"],
                              format: "uri",
                              description: "Site web de l'entreprise",
                            },
                            siret: {
                              type: ["string", "null"],
                              pattern: "^\\d{9,14}$",
                              description: "Siret de l'entreprise",
                            },
                            address: {
                              type: "object",
                              properties: {
                                label: {
                                  type: "string",
                                  description: "Adresse de l'offre, provenant du SIRET ou du partenaire",
                                },
                              },
                              required: ["label"],
                            },
                            brand: {
                              type: ["string", "null"],
                              description: "Nom d'enseigne de l'établissement",
                            },
                            legal_name: {
                              type: ["string", "null"],
                              description: "Nom légal de l'entreprise",
                            },
                            size: {
                              type: ["string", "null"],
                              description: "Taille de l'entreprise",
                            },
                            geopoint: {
                              type: "object",
                              properties: {
                                coordinates: {
                                  type: "array",
                                  prefixItems: [
                                    {
                                      type: "number",
                                      minimum: -180,
                                      maximum: 180,
                                      description: "Longitude",
                                    },
                                    {
                                      type: "number",
                                      minimum: -90,
                                      maximum: 90,
                                      description: "Latitude",
                                    },
                                  ],
                                },
                                type: {
                                  type: "string",
                                  enum: ["Point"],
                                },
                              },
                              required: ["coordinates", "type"],
                              description: "Geolocalisation de l'offre",
                            },
                            idcc: {
                              type: ["number", "null"],
                              description: "Identifiant convention collective",
                            },
                            opco: {
                              type: ["string", "null"],
                              description: "Nom de l'OPCO",
                            },
                            naf: {
                              type: ["object", "null"],
                              properties: {
                                code: {
                                  type: "string",
                                  description: "code NAF",
                                },
                                label: {
                                  type: ["string", "null"],
                                  description: "Libelle NAF",
                                },
                              },
                              required: ["code", "label"],
                            },
                          },
                          required: [
                            "name",
                            "description",
                            "website",
                            "siret",
                            "address",
                            "brand",
                            "legal_name",
                            "size",
                            "geopoint",
                            "idcc",
                            "opco",
                            "naf",
                          ],
                        },
                        apply: {
                          type: "object",
                          properties: {
                            phone: {
                              type: ["string", "null"],
                              description: "Téléphone de contact",
                            },
                            url: {
                              type: "string",
                              format: "uri",
                              description: "URL pour candidater",
                            },
                          },
                          required: ["phone", "url"],
                        },
                        contract: {
                          type: "object",
                          properties: {
                            start: {
                              anyOf: [
                                { type: "string", format: "date-time" },
                                { type: "string" },
                                { type: "string" },
                                { type: "null" },
                              ],
                              description: "Date de début du contrat",
                              format: "date-time",
                            },
                            duration: {
                              type: ["number", "null"],
                              description: "Durée du contrat en mois",
                            },
                            type: {
                              type: "array",
                              items: {
                                type: "string",
                                enum: ["Apprentissage", "Professionnalisation"],
                              },
                              description: "Type de contrat",
                            },
                            remote: {
                              type: ["string", "null"],
                              enum: ["onsite", "remote", "hybrid"],
                              description: "Format de travail de l'offre",
                            },
                          },
                          required: ["start", "duration", "type", "remote"],
                        },
                        offer: {
                          type: "object",
                          properties: {
                            title: {
                              type: "string",
                              minLength: 3,
                              description: "Titre de l'offre",
                            },
                            desired_skills: {
                              type: "array",
                              items: { type: "string" },
                              description: "Compétence attendues par le candidat pour l'offre",
                            },
                            to_be_acquired_skills: {
                              type: "array",
                              items: { type: "string" },
                              description: "Compétence acuqises durant l'alternance",
                            },
                            access_conditions: {
                              type: "array",
                              items: { type: "string" },
                              description: "Conditions d'accès à l'offre",
                            },
                            opening_count: {
                              type: "number",
                              description: "Nombre de poste disponible",
                            },
                            creation: {
                              anyOf: [
                                { type: "string", format: "date-time" },
                                { type: "string" },
                                { type: "string" },
                                { type: "null" },
                              ],
                              description: "Date de creation de l'offre",
                              format: "date-time",
                            },
                            expiration: {
                              anyOf: [
                                { type: "string", format: "date-time" },
                                { type: "string" },
                                { type: "string" },
                                { type: "null" },
                              ],
                              description:
                                "Date d'expiration de l'offre. Si pas présente, mettre à creation_date + 60j",
                              format: "date-time",
                            },
                            rome_codes: {
                              type: "array",
                              items: {
                                type: "string",
                                pattern: "^[A-Z]{1}\\d{4}$",
                                example: "D1102",
                              },
                            },
                            description: {
                              type: "string",
                              minLength: 30,
                              description:
                                "description de l'offre, soit définit par le partenaire, soit celle du ROME si pas suffisament grande",
                            },
                            target_diploma: {
                              type: ["object", "null"],
                              properties: {
                                european: {
                                  type: "string",
                                  enum: ["3", "4", "5", "6", "7"],
                                },
                                label: {
                                  type: "string",
                                  description: "Libellé du niveau de diplome",
                                },
                              },
                              required: ["european", "label"],
                            },
                            status: {
                              type: "string",
                              enum: ["Active", "Filled", "Cancelled", "Pending"],
                              description: "Status de l'offre (surtout utilisé pour les offres ajouté par API)",
                            },
                          },
                          required: [
                            "title",
                            "desired_skills",
                            "to_be_acquired_skills",
                            "access_conditions",
                            "opening_count",
                            "creation",
                            "expiration",
                            "rome_codes",
                            "description",
                            "target_diploma",
                            "status",
                          ],
                        },
                      },
                      required: ["identifier", "workplace", "apply", "contract", "offer"],
                    },
                  },
                  recruiters: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        identifier: {
                          type: "object",
                          properties: { id: { type: "string" } },
                          required: ["id"],
                        },
                        workplace: {
                          type: "object",
                          properties: {
                            name: {
                              type: ["string", "null"],
                              description: "Nom customisé de l'entreprise",
                            },
                            description: {
                              type: ["string", "null"],
                              description: "description de l'entreprise",
                            },
                            website: {
                              type: ["string", "null"],
                              format: "uri",
                              description: "Site web de l'entreprise",
                            },
                            siret: {
                              type: ["string", "null"],
                              pattern: "^\\d{9,14}$",
                              description: "Siret de l'entreprise",
                            },
                            address: {
                              type: "object",
                              properties: {
                                label: {
                                  type: "string",
                                  description: "Adresse de l'offre, provenant du SIRET ou du partenaire",
                                },
                              },
                              required: ["label"],
                            },
                            brand: {
                              type: ["string", "null"],
                              description: "Nom d'enseigne de l'établissement",
                            },
                            legal_name: {
                              type: ["string", "null"],
                              description: "Nom légal de l'entreprise",
                            },
                            size: {
                              type: ["string", "null"],
                              description: "Taille de l'entreprise",
                            },
                            geopoint: {
                              type: "object",
                              properties: {
                                coordinates: {
                                  type: "array",
                                  prefixItems: [
                                    {
                                      type: "number",
                                      minimum: -180,
                                      maximum: 180,
                                      description: "Longitude",
                                    },
                                    {
                                      type: "number",
                                      minimum: -90,
                                      maximum: 90,
                                      description: "Latitude",
                                    },
                                  ],
                                },
                                type: {
                                  type: "string",
                                  enum: ["Point"],
                                },
                              },
                              required: ["coordinates", "type"],
                              description: "Geolocalisation de l'offre",
                            },
                            idcc: {
                              type: ["number", "null"],
                              description: "Identifiant convention collective",
                            },
                            opco: {
                              type: ["string", "null"],
                              description: "Nom de l'OPCO",
                            },
                            naf: {
                              type: ["object", "null"],
                              properties: {
                                code: {
                                  type: "string",
                                  description: "code NAF",
                                },
                                label: {
                                  type: ["string", "null"],
                                  description: "Libelle NAF",
                                },
                              },
                              required: ["code", "label"],
                            },
                          },
                          required: [
                            "name",
                            "description",
                            "website",
                            "siret",
                            "address",
                            "brand",
                            "legal_name",
                            "size",
                            "geopoint",
                            "idcc",
                            "opco",
                            "naf",
                          ],
                        },
                        apply: {
                          type: "object",
                          properties: {
                            phone: {
                              type: ["string", "null"],
                              description: "Téléphone de contact",
                            },
                            url: {
                              type: "string",
                              format: "uri",
                              description: "URL pour candidater",
                            },
                          },
                          required: ["phone", "url"],
                        },
                      },
                      required: ["identifier", "workplace", "apply"],
                    },
                  },
                  warnings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        message: { type: "string" },
                        code: { type: "string" },
                      },
                      required: ["message", "code"],
                    },
                  },
                },
                required: ["jobs", "recruiters", "warnings"],
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });
  builder.addPath("/job/v1/offer", {
    post: {
      tags: ["Job"],
      summary: "Publier une offre d'emploi en alternance",
      description: "Publiez une offre d'emploi en alternance",
      operationId: "createJobOffer",
      security: [{ "api-key": [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                identifier: {
                  type: "object",
                  properties: {
                    partner_job_id: { type: ["string", "null"] },
                  },
                },
                workplace: {
                  type: "object",
                  properties: {
                    siret: {
                      type: "string",
                      pattern: "^\\d{9,14}$",
                      description: "Siret de l'entreprise",
                    },
                    name: {
                      type: ["string", "null"],
                      description: "Nom customisé de l'entreprise",
                    },
                    description: {
                      type: ["string", "null"],
                      description: "description de l'entreprise",
                    },
                    website: {
                      type: ["string", "null"],
                      format: "uri",
                      description: "Site web de l'entreprise",
                    },
                    address: {
                      type: ["object", "null"],
                      properties: {
                        label: {
                          type: "string",
                          description: "Adresse de l'offre, provenant du SIRET ou du partenaire",
                        },
                      },
                      required: ["label"],
                    },
                  },
                  required: ["siret"],
                },
                apply: {
                  type: "object",
                  properties: {
                    email: {
                      type: ["string", "null"],
                      format: "email",
                      description: "Email de contact",
                    },
                    url: {
                      type: ["string", "null"],
                      format: "uri",
                      description: "URL pour candidater",
                    },
                    phone: {
                      type: ["string", "null"],
                      description: "Téléphone de contact",
                    },
                  },
                },
                contract: {
                  type: "object",
                  properties: {
                    start: {
                      anyOf: [
                        { type: "string", format: "date-time" },
                        { type: "string" },
                        { type: "string" },
                        { type: "null" },
                      ],
                      description: "Date de début du contrat",
                      format: "date-time",
                    },
                    duration: {
                      type: ["number", "null"],
                      description: "Durée du contrat en mois",
                    },
                    type: {
                      type: "array",
                      items: {
                        type: "string",
                        enum: ["Apprentissage", "Professionnalisation"],
                      },
                      description: "Type de contrat",
                    },
                    remote: {
                      type: ["string", "null"],
                      enum: ["onsite", "remote", "hybrid"],
                      description: "Format de travail de l'offre",
                    },
                  },
                },
                offer: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      minLength: 3,
                      description: "Titre de l'offre",
                    },
                    description: {
                      type: "string",
                      description:
                        "description de l'offre, soit définit par le partenaire, soit celle du ROME si pas suffisament grande",
                    },
                    rome_codes: {
                      type: ["array", "null"],
                      items: {
                        type: "string",
                        pattern: "^[A-Z]{1}\\d{4}$",
                        example: "D1102",
                      },
                      description: "Code rome de l'offre",
                    },
                    desired_skills: {
                      type: "array",
                      items: { type: "string" },
                      description: "Compétence attendues par le candidat pour l'offre",
                    },
                    to_be_acquired_skills: {
                      type: "array",
                      items: { type: "string" },
                      description: "Compétence acuqises durant l'alternance",
                    },
                    access_conditions: {
                      type: "array",
                      items: { type: "string" },
                      description: "Conditions d'accès à l'offre",
                    },
                    opening_count: {
                      type: "number",
                      description: "Nombre de poste disponible",
                    },
                    target_diploma: {
                      type: ["object", "null"],
                      properties: {
                        european: {
                          type: "string",
                          enum: ["3", "4", "5", "6", "7"],
                          description: "Niveau de diplome visé en fin d'étude, transformé pour chaque partenaire",
                        },
                      },
                      required: ["european"],
                    },
                    creation: {
                      anyOf: [
                        { type: "string", format: "date-time" },
                        { type: "string" },
                        { type: "string" },
                        { type: "null" },
                      ],
                      description: "Date de creation de l'offre",
                      format: "date-time",
                    },
                    expiration: {
                      anyOf: [
                        { type: "string", format: "date-time" },
                        { type: "string" },
                        { type: "string" },
                        { type: "null" },
                      ],
                      description: "Date d'expiration de l'offre. Si pas présente, mettre à creation_date + 60j",
                      format: "date-time",
                    },
                    multicast: {
                      type: "boolean",
                      description: "Si l'offre peut être diffusé sur l'ensemble des plateformes partenaires",
                    },
                    origin: {
                      type: ["string", "null"],
                      description: "Origine de l'offre provenant d'un aggregateur",
                    },
                  },
                  required: ["title", "description"],
                },
              },
              required: ["workplace", "apply", "offer"],
            },
          },
        },
      },
      responses: {
        "200": {
          description: "",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { id: { type: "string" } },
                required: ["id"],
              },
            },
          },
        },
        ...errorResponses,
      },
    },
  });
  builder.addPath("/job/v1/offer/{id}", {
    put: {
      tags: ["Job"],
      summary: "Modification d'une offre d'emploi en alternance",
      description: "Modifiez une offre d'emploi en alternance",
      operationId: "updateJobOffer",
      security: [{ "api-key": [] }],
      parameters: [
        {
          schema: { type: "string" },
          required: true,
          name: "id",
          in: "path",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                identifier: {
                  type: "object",
                  properties: {
                    partner_job_id: { type: ["string", "null"] },
                  },
                },
                workplace: {
                  type: "object",
                  properties: {
                    siret: {
                      type: "string",
                      pattern: "^\\d{9,14}$",
                      description: "Siret de l'entreprise",
                    },
                    name: {
                      type: ["string", "null"],
                      description: "Nom customisé de l'entreprise",
                    },
                    description: {
                      type: ["string", "null"],
                      description: "description de l'entreprise",
                    },
                    website: {
                      type: ["string", "null"],
                      format: "uri",
                      description: "Site web de l'entreprise",
                    },
                    address: {
                      type: ["object", "null"],
                      properties: {
                        label: {
                          type: "string",
                          description: "Adresse de l'offre, provenant du SIRET ou du partenaire",
                        },
                      },
                      required: ["label"],
                    },
                  },
                  required: ["siret"],
                },
                apply: {
                  type: "object",
                  properties: {
                    email: {
                      type: ["string", "null"],
                      format: "email",
                      description: "Email de contact",
                    },
                    url: {
                      type: ["string", "null"],
                      format: "uri",
                      description: "URL pour candidater",
                    },
                    phone: {
                      type: ["string", "null"],
                      description: "Téléphone de contact",
                    },
                  },
                },
                contract: {
                  type: "object",
                  properties: {
                    start: {
                      anyOf: [
                        { type: "string", format: "date-time" },
                        { type: "string" },
                        { type: "string" },
                        { type: "null" },
                      ],
                      description: "Date de début du contrat",
                      format: "date-time",
                    },
                    duration: {
                      type: ["number", "null"],
                      description: "Durée du contrat en mois",
                    },
                    type: {
                      type: "array",
                      items: {
                        type: "string",
                        enum: ["Apprentissage", "Professionnalisation"],
                      },
                      description: "Type de contrat",
                    },
                    remote: {
                      type: ["string", "null"],
                      enum: ["onsite", "remote", "hybrid"],
                      description: "Format de travail de l'offre",
                    },
                  },
                },
                offer: {
                  type: "object",
                  properties: {
                    title: {
                      type: "string",
                      minLength: 3,
                      description: "Titre de l'offre",
                    },
                    description: {
                      type: "string",
                      description:
                        "description de l'offre, soit définit par le partenaire, soit celle du ROME si pas suffisament grande",
                    },
                    rome_codes: {
                      type: ["array", "null"],
                      items: {
                        type: "string",
                        pattern: "^[A-Z]{1}\\d{4}$",
                        example: "D1102",
                      },
                      description: "Code rome de l'offre",
                    },
                    desired_skills: {
                      type: "array",
                      items: { type: "string" },
                      description: "Compétence attendues par le candidat pour l'offre",
                    },
                    to_be_acquired_skills: {
                      type: "array",
                      items: { type: "string" },
                      description: "Compétence acuqises durant l'alternance",
                    },
                    access_conditions: {
                      type: "array",
                      items: { type: "string" },
                      description: "Conditions d'accès à l'offre",
                    },
                    opening_count: {
                      type: "number",
                      description: "Nombre de poste disponible",
                    },
                    target_diploma: {
                      type: ["object", "null"],
                      properties: {
                        european: {
                          type: "string",
                          enum: ["3", "4", "5", "6", "7"],
                          description: "Niveau de diplome visé en fin d'étude, transformé pour chaque partenaire",
                        },
                      },
                      required: ["european"],
                    },
                    creation: {
                      anyOf: [
                        { type: "string", format: "date-time" },
                        { type: "string" },
                        { type: "string" },
                        { type: "null" },
                      ],
                      description: "Date de creation de l'offre",
                      format: "date-time",
                    },
                    expiration: {
                      anyOf: [
                        { type: "string", format: "date-time" },
                        { type: "string" },
                        { type: "string" },
                        { type: "null" },
                      ],
                      description: "Date d'expiration de l'offre. Si pas présente, mettre à creation_date + 60j",
                      format: "date-time",
                    },
                    multicast: {
                      type: "boolean",
                      description: "Si l'offre peut être diffusé sur l'ensemble des plateformes partenaires",
                    },
                    origin: {
                      type: ["string", "null"],
                      description: "Origine de l'offre provenant d'un aggregateur",
                    },
                  },
                  required: ["title", "description"],
                },
              },
              required: ["workplace", "apply", "offer"],
            },
          },
        },
      },
      responses: {
        "204": {
          description: "",
          content: { "application/json": { schema: { type: "null" } } },
        },
        ...errorResponses,
      },
    },
  });

  return builder.getSpec();
}
