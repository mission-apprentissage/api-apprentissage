import { Container } from "@mui/material";

import { getServerTranslation } from "@/app/i18n";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { PAGES } from "@/utils/routes.utils";

import Accessibilite from "./components/Accessibilite";

export default async function AccessibilitePage({ params: { lang } }: PropsWithLangParams) {
  const { t } = await getServerTranslation(lang, "global");
  return (
    <Container maxWidth="xl">
      <Breadcrumb pages={[PAGES.static.accessibilite]} t={t} lang={lang} />
      <Accessibilite lang={lang} t={t} />
    </Container>
  );
}
