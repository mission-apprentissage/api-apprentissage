import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Box, Typography } from "@mui/material";
import type { OpenApiText } from "api-alternance-sdk/internal";
import { getTextOpenAPI } from "api-alternance-sdk/internal";

import type { WithLangAndT } from "@/app/i18n/settings";
import { Artwork } from "@/components/artwork/Artwork";
import { DsfrLink } from "@/components/link/DsfrLink";

type Props = WithLangAndT<{
  subject: OpenApiText;
  body: OpenApiText;
}>;

export function HabilitationRequise({ lang, t, subject, body }: Props) {
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
        <DsfrLink
          href={`mailto:support_api@apprentissage.beta.gouv.fr?subject=${encodeURIComponent(getTextOpenAPI(subject, lang))}&body=${getTextOpenAPI(body, lang)}`}
          arrow="none"
        >
          <Button priority="secondary" size="small">
            {t("habilitationRequise.faireDemande", { lng: lang })}
          </Button>
        </DsfrLink>
      </Box>
    </Box>
  );
}
