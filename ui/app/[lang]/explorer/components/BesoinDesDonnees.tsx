"use client"
import { fr } from "@codegouvfr/react-dsfr"
import { Box, Typography } from "@mui/material"
import type { DocPage, OpenapiHabilitation } from "api-alternance-sdk/internal"
import { getDemandeHabilitationMailto } from "api-alternance-sdk/internal"
import { useTranslation } from "react-i18next"
import type { WithLang } from "@/app/i18n/settings"
import { Artwork } from "@/components/artwork/Artwork"
import { DsfrLink } from "@/components/link/DsfrLink"
import { useAuth } from "@/context/AuthContext"
import { PAGES } from "@/utils/routes.utils"
import { SwaggerLink } from "./SwaggerLink"

export function BesoinDesDonnes({ doc, lang, habilitation }: WithLang<{ doc: DocPage; habilitation: null | OpenapiHabilitation }>) {
  const { t } = useTranslation("explorer", { lng: lang })

  const { session } = useAuth()
  const hasHabilitation = habilitation === null || session?.organisation?.habilitations.includes(habilitation)

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Box sx={{}}>
        <Artwork name="designer" />
        <Box sx={{ mx: fr.spacing("3w"), display: "flex", flexDirection: "column", gap: fr.spacing("1w") }}>
          <Typography className={fr.cx("fr-text--lead", "fr-text--bold")}>{t("besoinDonnees.titre", { lng: lang })}</Typography>
          <Typography>
            <SwaggerLink lang={lang} doc={doc} />
          </Typography>
          {/* Toujours proposée : une clé sandbox ne dépend pas de l'habilitation de l'organisation */}
          <Typography>
            <DsfrLink href={PAGES.static.compteProfil.getPath(lang)} size="lg">
              {t("besoinDonnees.obtenirCle", { lng: lang })}
            </DsfrLink>
          </Typography>
          {!hasHabilitation && (
            <Typography>
              <DsfrLink href={getDemandeHabilitationMailto(habilitation, lang)} size="lg">
                {t("besoinDonnees.demandeHabilitation", { lng: lang })}
              </DsfrLink>
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  )
}
