import { addBreadcrumbTranslations, Breadcrumb as DSFRBreadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import type { FC } from "react";

import type { WithLangAndT } from "@/app/i18n/settings";
import type { IPage } from "@/utils/routes.utils";
import { PAGES } from "@/utils/routes.utils";

export default function Breadcrumb({ pages, lang, t }: WithLangAndT<{ pages: IPage[] }>) {
  const rest = [...pages];
  const currentPage = rest.pop();

  return (
    <DSFRBreadcrumb
      currentPageLabel={currentPage?.getTitle(lang, t)}
      homeLinkProps={{
        href: PAGES.static.home.getPath(lang),
      }}
      segments={rest.map((page) => ({
        label: page.getTitle(lang, t),
        linkProps: {
          href: page.getPath(lang),
        },
      }))}
    />
  );
}
