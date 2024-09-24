import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Box, Container } from "@mui/material";
import { certificationModelDoc } from "api-alternance-sdk/internal";

import { getServerTranslation } from "@/app/i18n";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import { DsfrLink } from "@/components/link/DsfrLink";
import { PAGES } from "@/utils/routes.utils";

import { CatalogueData } from "./components/CatalogueData";
import { CatalogueHeadline } from "./components/CatalogueDonneeHeadline";
import { DataSources } from "./components/DataSources";

export default async function CatalogueCertificationPage({ params: { lang } }: PropsWithLangParams) {
  const { t } = await getServerTranslation(lang, "global");
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
            linkProps: { href: PAGES.static.explorerApi.path },
          },
        ]}
        style={{ marginBottom: fr.spacing("3w") }}
      />

      <Box sx={{ mb: fr.spacing("6w") }}>
        <DsfrLink href={PAGES.static.explorerApi.path} arrow="left" size="lg">
          Revenir à la liste
        </DsfrLink>
      </Box>

      <CatalogueHeadline lang={lang} t={t} />
      <CatalogueData model={certificationModelDoc} lang={lang} />
      <DataSources sources={certificationModelDoc.sources} />
    </Container>
  );
}
