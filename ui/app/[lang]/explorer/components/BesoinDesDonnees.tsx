"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Box, Typography } from "@mui/material";
import type { DocPage, OpenapiSpec } from "api-alternance-sdk/internal";
import { getTextOpenAPI, openapiSpec } from "api-alternance-sdk/internal";
import { useTranslation } from "react-i18next";

import { SwaggerLink } from "./SwaggerLink";
import type { WithLang } from "@/app/i18n/settings";
import { Artwork } from "@/components/artwork/Artwork";
import { DsfrLink } from "@/components/link/DsfrLink";
import { useAuth } from "@/context/AuthContext";
import { PAGES } from "@/utils/routes.utils";

export function BesoinDesDonnes({
  doc,
  lang,
  habilitation,
}: WithLang<{ doc: DocPage; habilitation: null | keyof OpenapiSpec["demandeHabilitations"] }>) {
  const { t } = useTranslation("explorer", { lng: lang });

  const { session } = useAuth();
  const hasHabilitation = habilitation === null || session?.organisation?.habilitations.includes(habilitation);

  const habilitationRequest = hasHabilitation ? null : openapiSpec.demandeHabilitations[habilitation];

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
          <Typography className={fr.cx("fr-text--lead", "fr-text--bold")}>
            {t("besoinDonnees.titre", { lng: lang })}
          </Typography>
          <Typography>
            <SwaggerLink lang={lang} doc={doc} />
          </Typography>
          {hasHabilitation && (
            <Typography>
              <DsfrLink href={PAGES.static.compteProfil.getPath(lang)} size="lg">
                {t("besoinDonnees.obtenirJeton", { lng: lang })}
              </DsfrLink>
            </Typography>
          )}
          {habilitationRequest && (
            <Typography>
              <DsfrLink
                href={`mailto:support_api@apprentissage.beta.gouv.fr?subject=${encodeURIComponent(getTextOpenAPI(habilitationRequest.subject, lang))}&body=${getTextOpenAPI(habilitationRequest.body, lang)}`}
                size="lg"
              >
                {t("besoinDonnees.demandeHabilitation", { lng: lang })}
              </DsfrLink>
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}
