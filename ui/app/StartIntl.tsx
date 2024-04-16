"use client";

import i18next from "i18next";
import { zodOpenApi } from "shared/zod/zodWithOpenApi";
import { zodI18nMap } from "zod-i18n-map";
import zodTranslation from "zod-i18n-map/locales/fr/zod.json";

i18next.init({
  lng: "fr",
  resources: { fr: { zod: zodTranslation } },
});
zodOpenApi.setErrorMap(zodI18nMap);

export function StartIntl() {
  //Yes, leave null here.
  return null;
}
