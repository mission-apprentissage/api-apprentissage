"use client"
import { fr } from "@codegouvfr/react-dsfr"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Box, Typography } from "@mui/material"
import type { OpenapiHabilitation } from "api-alternance-sdk/internal"
import { demandeHabilitationsOpenapi, getDemandeHabilitationMailto } from "api-alternance-sdk/internal"
import { useTranslation } from "react-i18next"

import type { WithLang } from "@/app/i18n/settings"
import { Artwork } from "@/components/artwork/Artwork"
import { AccesHabilitationsLink } from "@/components/link/AccesHabilitationsLink"
import { DsfrLink } from "@/components/link/DsfrLink"
import { useAuth } from "@/context/AuthContext"
import { PAGES } from "@/utils/routes.utils"

type Props = WithLang<{
  habilitation: null | OpenapiHabilitation
}>

export function HabilitationRequise({ lang, habilitation }: Props) {
  const { t } = useTranslation("explorer", { lng: lang })

  const { session } = useAuth()

  if (habilitation === null || session?.organisation?.habilitations.includes(habilitation)) {
    return null
  }

  const { restriction } = demandeHabilitationsOpenapi[habilitation]

  return (
    <Box
      sx={{
        paddingX: fr.spacing("4w"),
        paddingY: fr.spacing("3w"),
        borderColor: "#dddddd",
        borderWidth: "1px",
        borderStyle: "solid",
        gap: fr.spacing("3w"),
        display: "flex",
        marginTop: fr.spacing("5w"),
      }}
    >
      <Artwork name="padlock" />
      <Box sx={{ display: "flex", gap: fr.spacing("1w"), flexDirection: "column" }}>
        <Typography
          sx={{
            textWrap: "balance",
          }}
          className={fr.cx("fr-text--bold")}
        >
          {t("habilitationRequise.titre", { lng: lang })}
        </Typography>
        {restriction === null ? (
          <Typography className={fr.cx("fr-text--sm")}>
            {t("habilitationRequise.ouSandbox", { lng: lang })}{" "}
            <DsfrLink href={PAGES.static.compteProfil.getPath(lang)}>{t("habilitationRequise.ouSandboxLien", { lng: lang })}</DsfrLink>
          </Typography>
        ) : (
          <Typography className={fr.cx("fr-text--sm")}>{restriction[lang]}</Typography>
        )}
        <Typography className={fr.cx("fr-text--sm")}>
          {t("habilitationRequise.enSavoirPlus", { lng: lang })} <AccesHabilitationsLink lang={lang} size="sm" />
        </Typography>
        <DsfrLink href={getDemandeHabilitationMailto(habilitation, lang)} arrow="none" external={false}>
          <Button priority="secondary" size="small">
            {t("habilitationRequise.faireDemande", { lng: lang })}
          </Button>
        </DsfrLink>
      </Box>
    </Box>
  )
}
