"use client"

import { changeLanguage, use } from "i18next"
import resourcesToBackend from "i18next-resources-to-backend"
import { initReactI18next } from "react-i18next"
import { z } from "zod/v4-mini"

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
  // Les messages d'erreur Zod génériques (par défaut) sont en anglais sans ceci ; on les aligne
  // sur la langue de la page. Les messages custom (shared/models/user.model.ts) sont eux des
  // clefs de traduction, résolues côté UI via t(error.message) — voir getInputState.
  z.config(lang === "en" ? z.locales.en() : z.locales.fr())
  //Yes, leave null here.
  return null
}
