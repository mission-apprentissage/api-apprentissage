import { Container } from "@mui/material";

import { getServerTranslation } from "@/app/i18n";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { PAGES } from "@/utils/routes.utils";

import MentionsLegales from "./components/MentionLegales";

export default async function MentionsLegalesPage({ params: { lang } }: PropsWithLangParams) {
  const { t } = await getServerTranslation(lang, "global");
  return (
    <Container maxWidth="xl">
      <Breadcrumb pages={[PAGES.static.mentionsLegales]} lang={lang} t={t} />
      <MentionsLegales />
    </Container>
  );
}
