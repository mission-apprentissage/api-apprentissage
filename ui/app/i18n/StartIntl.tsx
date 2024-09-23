"use client";

import { zodOpenApi } from "api-alternance-sdk/internal";
import { changeLanguage, use } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";
import zodEn from "zod-i18n-map/locales/en/zod.json";
import zodFr from "zod-i18n-map/locales/fr/zod.json";

import type { Lang, Namespace } from "./settings";
import { getOptions, languages } from "./settings";

const runsOnServerSide = typeof window === "undefined";

use(initReactI18next)
  .use(
    resourcesToBackend(
      async (language: Lang, namespace: Namespace) => import(`./locales/${language}/${namespace}.json`)
    )
  )
  .init({
    ...getOptions(),
    detection: {
      order: ["path", "htmlTag", "cookie", "navigator"],
    },
    preload: runsOnServerSide ? languages : [],
    resources: { fr: { zod: zodFr }, en: { zod: zodEn } },
  });

z.setErrorMap(zodI18nMap);

export function StartIntl({ lang }: { lang: Lang }) {
  changeLanguage(lang);
  //Yes, leave null here.
  return null;
}
