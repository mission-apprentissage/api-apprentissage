"use client"

import { accesHabilitationsSectionOpenapi } from "api-alternance-sdk/internal"

import type { WithLang } from "@/app/i18n/settings"
import { DsfrLink } from "@/components/link/DsfrLink"
import { PAGES } from "@/utils/routes.utils"

// Point d'entrée unique vers la section de la doc technique qui décrit accès, habilitations et sandbox
export function AccesHabilitationsLink({ lang, size = "md" }: WithLang<{ size?: "sm" | "md" | "lg" }>) {
  const { title, anchor } = accesHabilitationsSectionOpenapi

  return (
    <DsfrLink href={{ pathname: PAGES.static.documentationTechnique.getPath(lang), hash: anchor[lang] }} size={size}>
      {title[lang]}
    </DsfrLink>
  )
}
