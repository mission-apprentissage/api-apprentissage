"use client";

import type { DocPage } from "api-alternance-sdk/internal";
import { getTextOpenAPI, openapiSpec } from "api-alternance-sdk/internal";
import { useTranslation } from "react-i18next";
import { safeSlugify } from "redoc";

import type { WithLang } from "@/app/i18n/settings";
import { DsfrLink } from "@/components/link/DsfrLink";
import { PAGES } from "@/utils/routes.utils";

export function SwaggerLink({ lang, doc }: WithLang<{ doc: DocPage }>) {
  const { t } = useTranslation("explorer");

  return (
    <DsfrLink
      href={{
        pathname: PAGES.static.documentationTechnique.getPath(lang),
        hash: `tag/${safeSlugify(getTextOpenAPI(openapiSpec.tags[doc.tag].name, lang))}/operation/${doc.operationIds[0]}`,
      }}
      size="lg"
    >
      {t("besoinDonnees.swagger", { lng: lang })}
    </DsfrLink>
  );
}
