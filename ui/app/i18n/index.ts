import acceptLanguage from "accept-language";
import { createInstance } from "i18next";
import type { TFunction, i18n as i18nT } from "i18next";
import resourcesToBackend from "i18next-resources-to-backend";
import { initReactI18next } from "react-i18next/initReactI18next";

import type { Lang, Namespace } from "./settings";
import { getOptions } from "./settings";

acceptLanguage.languages(["fr", "en"]);

const initI18next = async (lang: Lang): Promise<i18nT> => {
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

export async function getServerTranslation<N extends Namespace>(
  lang: Lang,
  ns: N
): Promise<{
  t: TFunction<N, undefined>;
  i18n: i18nT;
}> {
  const i18nextInstance = await initI18next(lang);
  return {
    t: i18nextInstance.getFixedT<N, undefined, N>(lang, ns),
    i18n: i18nextInstance,
  };
}
