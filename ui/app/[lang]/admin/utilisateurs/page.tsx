import { Typography } from "@mui/material";

import { getServerTranslation } from "@/app/i18n";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { PAGES } from "@/utils/routes.utils";

import UserList from "./components/UserList";

export default async function AdminUsersPage({ params }: PropsWithLangParams) {
  const { lang } = await params;
  const { t } = await getServerTranslation(lang, "global");
  return (
    <>
      <Breadcrumb pages={[PAGES.static.adminUsers]} lang={lang} t={t} />
      <Typography variant="h2" gutterBottom>
        {PAGES.static.adminUsers.getTitle(lang, t)}
      </Typography>
      <UserList lang={lang} />
    </>
  );
}
