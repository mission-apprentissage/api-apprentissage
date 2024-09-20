export const fallbackLng = "fr" as const;
export const languages = [fallbackLng, "en"] as const;
export const cookieName = "i18n-locale";
export const defaultNS = "global" as const;

export type Lang = "fr" | "en";

export type Namespace = "global";

export function isValidLang(lang: unknown): lang is Lang {
  return languages.includes(lang as Lang);
}

export function getOptions(lng: Lang = fallbackLng, ns: Namespace = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  };
}

export type PropsWithLangParams = {
  params: { lang: Lang };
};
