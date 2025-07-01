import { Notice } from "@codegouvfr/react-dsfr/Notice";

import { useApiKeysStatut } from "@/app/[lang]/compte/profil/hooks/useApiKeys";
import type { WithLangAndT } from "@/app/i18n/settings";

export function ManageApiKeysBanner({ lang, t }: WithLangAndT) {
  const statut = useApiKeysStatut();

  if (statut !== "actif-ready") {
    return null;
  }

  return <Notice title={<>{t("monCompte.votreJetonCree", { lng: lang })} &nbsp;</>} />;
}
