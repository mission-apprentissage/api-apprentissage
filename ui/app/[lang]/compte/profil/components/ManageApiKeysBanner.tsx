import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { Box } from "@mui/material";

import { useApiKeysStatut } from "@/app/[lang]/compte/profil/hooks/useApiKeys";
import type { WithLangAndT } from "@/app/i18n/settings";

export function ManageApiKeysBanner({ lang, t }: WithLangAndT) {
  const statut = useApiKeysStatut();

  if (statut !== "actif-ready") {
    return null;
  }

  return (
    <Notice
      title={
        <>
          {typeof t("monCompte.votreJetonCree", { lng: lang }) === "string"
            ? t("monCompte.votreJetonCree", { lng: lang })
            : ""}{" "}
          &nbsp;
          <Box component="span" sx={{ fontWeight: "normal" }}>
            {typeof t("monCompte.jetonCopie", { lng: lang }) === "string"
              ? t("monCompte.jetonCopie", { lng: lang })
              : ""}
          </Box>
        </>
      }
    />
  );
}
