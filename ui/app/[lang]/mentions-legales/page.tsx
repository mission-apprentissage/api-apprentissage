import { Container } from "@mui/material";

import MentionsLegales from "./components/MentionLegales";
import { getServerTranslation } from "@/app/i18n";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { PAGES } from "@/utils/routes.utils";

export default async function MentionsLegalesPage({ params }: PropsWithLangParams) {
  const { lang } = await params;
  const { t } = await getServerTranslation(lang, "global");
  return (
    <Container maxWidth="xl">
      <Breadcrumb pages={[PAGES.static.mentionsLegales]} lang={lang} t={t} />
      <MentionsLegales />
    </Container>
  );
}
