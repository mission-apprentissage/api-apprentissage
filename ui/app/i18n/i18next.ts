// import the original type declarations
import "i18next";

import type nsZod from "zod-i18n-map/locales/fr/zod.json";

import type nsDocumentationTechnique from "./locales/fr/documentation-technique.json";
import type nsExplorer from "./locales/fr/explorer.json";
import type nsGlobal from "./locales/fr/global.json";
import type nsInscriptionConnexion from "./locales/fr/inscription-connexion.json";
import type { fallbackLng } from "./settings";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "global";

    resources: {
      "documentation-technique": typeof nsDocumentationTechnique;
      explorer: typeof nsExplorer;
      global: typeof nsGlobal;
      "inscription-connexion": typeof nsInscriptionConnexion;
      zod: typeof nsZod;
    };
  }
}
