import { fr } from "@codegouvfr/react-dsfr";
import { Box, Typography } from "@mui/material";

import type { WithLangAndT } from "@/app/i18n/settings";
import { Artwork } from "@/components/artwork/Artwork";
import { DsfrLink } from "@/components/link/DsfrLink";
import { PAGES } from "@/utils/routes.utils";

export function BesoinDesDonnes({ lang, t }: WithLangAndT) {
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
            <DsfrLink href={PAGES.static.documentationTechnique.path} size="lg">
              {t("besoinDonnees.swagger", { lng: lang })}
            </DsfrLink>
          </Typography>
          <Typography>
            <DsfrLink href={PAGES.static.compteProfil.path} size="lg">
              {t("besoinDonnees.obtenirJeton", { lng: lang })}
            </DsfrLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
