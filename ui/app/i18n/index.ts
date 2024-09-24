import acceptLanguage from "accept-language";
import { createInstance } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";

import type { Lang, Namespace } from "./settings";
import { getOptions } from "./settings";

acceptLanguage.languages(["fr", "en"]);

const initI18next = async (lang: Lang) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(
      resourcesToBackend(async (language: Lang, namespace: Namespace) => {
        if (namespace === "zod") {
          return import(`zod-i18n-map/locales/${language}/zod.json`);
        }
        return import(`./locales/${language}/${namespace}.json`);
      })
    )
    .use(initReactI18next)
    .init(getOptions(lang));

  return i18nInstance;
};

export async function getServerTranslation<N extends Namespace>(lang: Lang, ns: N) {
  const i18nextInstance = await initI18next(lang);
  return {
    t: i18nextInstance.getFixedT<N>(lang, ns),
    i18n: i18nextInstance,
  };
}
