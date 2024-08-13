"use client";

import { zodOpenApi } from "api-alternance-sdk/internal";
import { init } from "i18next";
import { zodI18nMap } from "zod-i18n-map";
import zodTranslation from "zod-i18n-map/locales/fr/zod.json";

init({
  lng: "fr",
  resources: { fr: { zod: zodTranslation } },
});
zodOpenApi.setErrorMap(zodI18nMap);

export function StartIntl() {
  //Yes, leave null here.
  return null;
}
