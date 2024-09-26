import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Box, Container } from "@mui/material";
import { certificationModelDoc } from "api-alternance-sdk/internal";

import { CatalogueData } from "@/app/[lang]/explorer/components/CatalogueData";
import { CatalogueHeadline } from "@/app/[lang]/explorer/components/CatalogueHeadline";
import { DataSources } from "@/app/[lang]/explorer/components/DataSources";
import { getServerTranslation } from "@/app/i18n";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import { DsfrLink } from "@/components/link/DsfrLink";
import { PAGES } from "@/utils/routes.utils";

export default async function CatalogueCertificationPage({ params: { lang } }: PropsWithLangParams) {
  const { t } = await getServerTranslation(lang, "explorer");
  return (
    <Container maxWidth="xl" sx={{ marginTop: fr.spacing("2w"), marginBottom: fr.spacing("9w") }}>
      <Breadcrumb
        currentPageLabel={PAGES.static.catalogueDesDonneesCertification.getTitle(lang, t)}
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
          Revenir à la liste
        </DsfrLink>
      </Box>

      <CatalogueHeadline
        type="data"
        lang={lang}
        t={t}
        title={PAGES.static.depotOffre.getTitle(lang, t)}
        dangerousHtmlDescriptions={[
          t("catalogueDesDonneesCertification.summary", {
            lienLba: `<a href="https://labonnealternance.apprentissage.beta.gouv.fr/" target="_blank">La bonne alternance</a>`,
            lienPartenaire:
              `(<a class="fr-link" href="https://mission-apprentissage.notion.site/Liste-des-partenaires-de-La-bonne-alternance-3e9aadb0170e41339bac486399ec4ac1" target="_blank">${t("depotOffre.liste_partenaire", { lng: lang })}</a>)` as string,
          }),
        ]}
        frequenceMiseAJour="daily"
      />
      <CatalogueData
        models={{ [t("catalogueDesDonneesCertification.variant")]: certificationModelDoc }}
        lang={lang}
        t={t}
      />
      <DataSources sources={certificationModelDoc.sources} />
    </Container>
  );
}
