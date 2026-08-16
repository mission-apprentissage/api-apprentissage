"use client"

import { changeLanguage, use } from "i18next"
import resourcesToBackend from "i18next-resources-to-backend"
import { initReactI18next } from "react-i18next"

import type { Lang, Namespace } from "./settings"
import { getOptions, languages } from "./settings"

const runsOnServerSide = typeof window === "undefined"

// This is not a hook, it's a function that must be called at the root of the app.
// `void` : l'initialisation est volontairement non attendue, le rendu ne doit pas être bloqué.
void use(initReactI18next)
  .use(
    resourcesToBackend(async (language: Lang, namespace: Namespace) => {
      return import(`./locales/${language}/${namespace}.json`)
    })
  )
  .init({
    ...getOptions(),
    preload: runsOnServerSide ? languages : [],
  })

export function StartIntl({ lang }: { lang: Lang }) {
  // `void` : le changement de langue est volontairement non attendu.
  void changeLanguage(lang)
  //Yes, leave null here.
  return null
}
