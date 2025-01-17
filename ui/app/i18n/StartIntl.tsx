"use client";

import { changeLanguage, use } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next";
import { z } from "zod";
import { zodI18nMap } from "zod-i18n-map";

import type { Lang, Namespace } from "./settings";
import { getOptions, languages } from "./settings";

const runsOnServerSide = typeof window === "undefined";

// This is not a hook, it's a function that must be called at the root of the app.
// eslint-disable-next-line react-hooks/rules-of-hooks
const i18n = use(initReactI18next)
  .use(
    resourcesToBackend(async (language: Lang, namespace: Namespace) => {
      if (namespace === "zod") {
        return import(`zod-i18n-map/locales/${language}/zod.json`);
      }
      return import(`./locales/${language}/${namespace}.json`);
    })
  )
  .init({
    ...getOptions(),
    preload: runsOnServerSide ? languages : [],
  });

z.setErrorMap(zodI18nMap);

export function StartIntl({ lang }: { lang: Lang }) {
  changeLanguage(lang);
  //Yes, leave null here.
  return null;
}
