import { certificationsPageDoc } from "api-alternance-sdk/internal";

import { CataloguePage } from "@/app/[lang]/explorer/components/CataloguePage";
import { getServerTranslation } from "@/app/i18n";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import { PAGES } from "@/utils/routes.utils";

export default async function CatalogueCertificationPage({ params: { lang } }: PropsWithLangParams) {
  const { t } = await getServerTranslation(lang, "explorer");
  return (
    <CataloguePage doc={certificationsPageDoc} lang={lang} t={t} page={PAGES.static.catalogueDesDonneesCertification} />
  );
}
