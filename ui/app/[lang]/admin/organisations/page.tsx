import { Typography } from "@mui/material";

import OrganisationList from "./components/OrganisationList";
import { getServerTranslation } from "@/app/i18n";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { PAGES } from "@/utils/routes.utils";

export default async function AdminOrganisationPage({ params }: PropsWithLangParams) {
  const { lang } = await params;
  const { t } = await getServerTranslation(lang, "global");
  return (
    <>
      <Breadcrumb pages={[PAGES.static.adminOrganisations]} lang={lang} t={t} />
      <Typography variant="h2" gutterBottom>
        {PAGES.static.adminOrganisations.getTitle(lang, t)}
      </Typography>
      <OrganisationList lang={lang} />
    </>
  );
}
