import { Notice } from "@codegouvfr/react-dsfr/Notice";
import { Box } from "@mui/material";

import { useApiKeysStatut } from "@/app/compte/profil/hooks/useApiKeys";

export function ManageApiKeysBanner() {
  const statut = useApiKeysStatut();

  if (statut !== "actif-ready") {
    return null;
  }

  return (
    <Notice
      title={
        <>
          Votre jeton a bien été crée. &nbsp;
          <Box component="span" sx={{ fontWeight: "normal" }}>
            Il sera crypté une fois que vous aurez quitté cette page, vous n’aurez donc plus la possibilité de le
            copier.
          </Box>
        </>
      }
    />
  );
}
