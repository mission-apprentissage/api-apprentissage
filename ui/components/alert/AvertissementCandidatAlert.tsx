"use client"

import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { avertissementCandidatOpenapi } from "api-alternance-sdk/internal"

import type { WithLang } from "@/app/i18n/settings"

export function AvertissementCandidatAlert({ lang, closable = false, className }: WithLang<{ closable?: boolean; className?: string }>) {
  const { accroche, texte, lien } = avertissementCandidatOpenapi

  return (
    <Alert
      severity="info"
      small
      closable={closable}
      className={className}
      description={
        <>
          <strong>{accroche[lang]}</strong> {texte[lang]}{" "}
          <a href={lien.href} target="_blank" rel="noopener noreferrer" title={lien.title[lang]}>
            {lien.label[lang]}
          </a>
          .
        </>
      }
    />
  )
}
