import { Container } from "@mui/material";

import { getServerTranslation } from "@/app/i18n";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { PAGES } from "@/utils/routes.utils";

import Cgu from "./components/Cgu";

export default async function CGUPage({ params: { lang } }: PropsWithLangParams) {
  const { t } = await getServerTranslation(lang, "global");
  return (
    <Container maxWidth="xl">
      <Breadcrumb pages={[PAGES.static.cgu]} lang={lang} t={t} />
      <Cgu />
    </Container>
  );
}
