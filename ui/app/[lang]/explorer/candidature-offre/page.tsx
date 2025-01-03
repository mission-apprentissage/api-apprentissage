import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { Box, Container } from "@mui/material";
import { applicationModelDoc } from "api-alternance-sdk/internal";

import { CatalogueData } from "@/app/[lang]/explorer/components/CatalogueData";
import { CatalogueHeadline } from "@/app/[lang]/explorer/components/CatalogueHeadline";
import { DataSources } from "@/app/[lang]/explorer/components/DataSources";
import { getServerTranslation } from "@/app/i18n";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import { DsfrLink } from "@/components/link/DsfrLink";
import { PAGES } from "@/utils/routes.utils";

export default async function CandidatureOffrePage({ params: { lang } }: PropsWithLangParams) {
  const { t } = await getServerTranslation(lang, "explorer");

  return (
    <Container maxWidth="xl" sx={{ marginTop: fr.spacing("2w"), marginBottom: fr.spacing("9w") }}>
      <Breadcrumb
        currentPageLabel={PAGES.static.candidatureOffre.getTitle(lang, t)}
        homeLinkProps={{
          href: "/",
        }}
        segments={[
          {
            label: PAGES.static.explorerApi.getTitle(lang, t),
            linkProps: { href: PAGES.static.explorerApi.getPath(lang) },
          },
        ]}
        style={{ marginBottom: fr.spacing("3w") }}
      />

      <Box sx={{ mb: fr.spacing("6w") }}>
        <DsfrLink href={PAGES.static.explorerApi.getPath(lang)} arrow="left" size="lg">
          {t("back")}
        </DsfrLink>
      </Box>

      <CatalogueHeadline
        type="data"
        lang={lang}
        t={t}
        title={PAGES.static.candidatureOffre.getTitle(lang, t)}
        dangerousHtmlDescriptions={[
          t("candidatureOffre.summary_1", { lang: lang }),
          t("candidatureOffre.summary_2", { lang: lang }),
        ]}
        frequenceMiseAJour={null}
      />
      <CatalogueData
        models={{
          [t("candidatureOffre.variant")]: applicationModelDoc,
        }}
        lang={lang}
        t={t}
      />
      <DataSources sources={applicationModelDoc.sources} />
    </Container>
  );
}
