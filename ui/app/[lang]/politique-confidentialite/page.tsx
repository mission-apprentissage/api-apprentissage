import { Container } from "@mui/material";

import { getServerTranslation } from "@/app/i18n";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { PAGES } from "@/utils/routes.utils";

import PolitiqueConfidentialite from "./components/PolitiqueConfidentialite";

export default async function PolitiqueConfidentialitePage({ params: { lang } }: PropsWithLangParams) {
  const { t } = await getServerTranslation(lang, "global");
  return (
    <Container maxWidth="xl">
      <Breadcrumb pages={[PAGES.static.politiqueConfidentialite]} lang={lang} t={t} />
      <PolitiqueConfidentialite />
    </Container>
  );
}
