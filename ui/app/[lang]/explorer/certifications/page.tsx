import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Box, Container } from "@mui/material";
import { certificationModelDoc } from "api-alternance-sdk/internal";

import type { PropsWithLangParams } from "@/app/i18n/settings";
import { DsfrLink } from "@/components/link/DsfrLink";
import { PAGES } from "@/utils/routes.utils";

import { CatalogueData } from "./components/CatalogueData";
import { CatalogueHeadline } from "./components/CatalogueDonneeHeadline";
import { DataSources } from "./components/DataSources";

export default function CatalogueCertificationPage({ params: { lang } }: PropsWithLangParams) {
  return (
    <Container maxWidth="xl" sx={{ marginTop: fr.spacing("2w"), marginBottom: fr.spacing("9w") }}>
      <Breadcrumb
        currentPageLabel={PAGES.static.catalogueDesDonneesCertification.title}
        homeLinkProps={{
          href: "/",
        }}
        segments={[
          {
            label: PAGES.static.explorerApi.title,
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

      <CatalogueHeadline />
      <CatalogueData model={certificationModelDoc} lang={lang} />
      <DataSources sources={certificationModelDoc.sources} />
    </Container>
  );
}
