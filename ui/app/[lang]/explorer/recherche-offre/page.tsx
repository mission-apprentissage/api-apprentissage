import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { Box, Container } from "@mui/material";
import { offerReadModelDoc, recruiterModelDoc } from "api-alternance-sdk/internal";

import { CatalogueData } from "@/app/[lang]/explorer/components/CatalogueData";
import { CatalogueHeadline } from "@/app/[lang]/explorer/components/CatalogueHeadline";
import { DataSources } from "@/app/[lang]/explorer/components/DataSources";
import { getServerTranslation } from "@/app/i18n";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import { DsfrLink } from "@/components/link/DsfrLink";
import { PAGES } from "@/utils/routes.utils";

export default async function RechercheOffrePage({ params: { lang } }: PropsWithLangParams) {
  const { t } = await getServerTranslation(lang, "explorer");

  return (
    <Container maxWidth="xl" sx={{ marginTop: fr.spacing("2w"), marginBottom: fr.spacing("9w") }}>
      <Breadcrumb
        currentPageLabel={PAGES.static.rechercheOffre.getTitle(lang, t)}
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
        type="outil"
        lang={lang}
        t={t}
        title={PAGES.static.depotOffre.getTitle(lang, t)}
        dangerousHtmlDescriptions={[
          t("rechercheOffre.summary", {
            lienLba: `<a href="https://labonnealternance.apprentissage.beta.gouv.fr/" target="_blank">La bonne alternance</a>`,
            lang: lang,
          }),
          t("rechercheOffre.tip", { lang: lang }),
        ]}
        note={t("rechercheOffre.note", { lang: lang })}
        frequenceMiseAJour="daily"
      />
      <CatalogueData
        models={{
          [t("rechercheOffre.variantOffre")]: offerReadModelDoc,
          [t("rechercheOffre.variantRecruteur")]: recruiterModelDoc,
        }}
        lang={lang}
        t={t}
      />
      <DataSources sources={offerReadModelDoc.sources} />
    </Container>
  );
}
