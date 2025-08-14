import type { TFunction } from "i18next";
import type { EmptyObject } from "type-fest";

export const fallbackLng = "fr" as const;
export const languages = [fallbackLng, "en"] as const;
export const cookieName = "i18n-locale";
export const defaultNS = "global" as const;

export type Lang = "fr" | "en";

export type Namespace = "global" | "documentation-technique" | "explorer" | "inscription-connexion";

export function isValidLang(lang: unknown): lang is Lang {
  return languages.includes(lang as Lang);
}

export function getOptions(lng: Lang = fallbackLng) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns: ["global", "documentation-technique", "explorer", "inscription-connexion"],
  };
}

export type WithLang<T = EmptyObject> = T & {
  lang: Lang;
};

export type WithLangAndT<T = EmptyObject> = WithLang<T> & {
  t: TFunction<Namespace>;
};

export type PropsWithLangParams<T = EmptyObject> = {
  params: Promise<WithLang<T>>;
};
