import type { DocBusinessSection } from "../../../../types.js";
import workplaceDomain from "./workplace.domain/index.js";
import workplaceLocation from "./workplace.location/index.js";
import workplace from "./workplace/index.js";

export default {
  name: "Workplace",
  fields: {
    workplace,
    ["workplace.brand"]: {
      type: "technical",
      description: "Brand name of the establishment",
      examples: ["Enseigne (todo)"],
    },
    ["workplace.description"]: {
      type: "technical",
      description: "Description de l’employeur et/ou du service où s’exécutera le contrat",
      examples: [
        "Service du Premier ministre, placé sous l’autorité du ministre de la Transformation et de la Fonction publiques, la direction interministérielle du numérique (DINUM) a pour mission d’élaborer la stratégie numérique de l’État et de piloter sa mise en œuvre. Notre objectif : un État plus efficace, plus simple et plus souverain grâce au numérique.",
      ],
    },
    ["workplace.domain"]: workplaceDomain,
    ["workplace.domain.idcc"]: {
      type: "technical",
      description: "Numéro de la convention collective associé au numéro SIRET",
      examples: [1979],
    },
    ["workplace.domain.naf"]: {
      type: "technical",
      description: "NAF code (sector of activity) associated with the SIRET number",
    },
    ["workplace.domain.naf.code"]: {
      type: "technical",
      description: "NAF code (sector of activity) associated with the SIRET number",
      examples: ["8411Z"],
    },
    ["workplace.domain.naf.label"]: {
      type: "technical",
      description: "Label of the NAF code (sector of activity) associated with the SIRET number",
      examples: ["Administration publique générale"],
    },
    ["workplace.domain.opco"]: {
      type: "technical",
      description: "Competency Operator (OPCO) associated with the SIRET number",
      examples: ["OPCO 2i"],
    },
    ["workplace.legal_name"]: {
      type: "technical",
      description: "Company legal name",
    },
    ["workplace.location"]: workplaceLocation,
    ["workplace.location.address"]: {
      type: "technical",
      description: "Postal address of the job offer location.",
      examples: ["20 AVENUE DE SEGUR 75007 PARIS"],
    },
    ["workplace.location.geopoint"]: {
      type: "technical",
      description: "Géolocalisation rattachée à l'adresse",
      notes: "Geolocation linked to the address",
    },
    ["workplace.location.geopoint.coordinates"]: {
      type: "technical",
      description: "Coordinates of the geolocation linked to the address",
    },
    ["workplace.location.geopoint.coordinates[0]"]: {
      type: "technical",
      description: "Longitude",
      examples: [48.850699],
    },
    ["workplace.location.geopoint.coordinates[1]"]: {
      type: "technical",
      description: "Latitude",
      examples: [2.308628],
    },
    ["workplace.location.geopoint.type"]: {
      type: "technical",
      description: "GeoJSON type related to the geolocation linked to the address",
    },
    ["workplace.name"]: {
      type: "technical",
      description: "Name of the establishment (brand name or, failing that, legal name)",
      notes:
        "In the case of publishing a job offer, it is possible to use a custom name; otherwise, it will take the value of the brand name, or failing that, the legal name.",
      examples: ["DIRECTION INTERMINISTERIELLE DU NUMERIQUE (DINUM)"],
    },
    ["workplace.siret"]: {
      type: "technical",
      description: "SIRET of the contract execution location",
      examples: ["13002526500013"],
    },
    ["workplace.size"]: {
      type: "technical",
      description: "Company workforce range, in number of employees",
      examples: ["100-199"],
    },
    ["workplace.website"]: {
      type: "technical",
      description: "Company website",
      examples: ["https://beta.gouv.fr/startups/"],
    },
  },
} as const satisfies DocBusinessSection;
