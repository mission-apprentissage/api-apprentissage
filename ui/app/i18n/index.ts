import acceptLanguage from "accept-language";
import { createInstance } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";

import type { Lang, Namespace } from "./settings";
import { getOptions } from "./settings";

acceptLanguage.languages(["fr", "en"]);

const initI18next = async (lang: Lang, ns: Namespace) => {
  const i18nInstance = createInstance();
  await i18nInstance
    .use(initReactI18next)
    .use(
      resourcesToBackend(
        async (language: Lang, namespace: Namespace) => import(`./locales/${language}/${namespace}.json`)
      )
    )
    .init(getOptions(lang, ns));
  return i18nInstance;
};

export async function getServerTranslation(lang: Lang, ns: Namespace) {
  const i18nextInstance = await initI18next(lang, ns);
  return {
    t: i18nextInstance.getFixedT(lang, ns),
    i18n: i18nextInstance,
  };
}
