import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Box, Container } from "@mui/material";
import { certificationDoc } from "shared/docs/certification/certification.doc";

import { DsfrLink } from "@/components/link/DsfrLink";
import { PAGES } from "@/utils/routes.utils";

import { CatalogueData } from "./components/CatalogueData";
import { CatalogueHeadline } from "./components/CatalogueDonneeHeadline";

export default function CatalogueCertificationPage() {
  return (
    <Container maxWidth="xl" sx={{ marginTop: fr.spacing("2w"), marginBottom: fr.spacing("9w") }}>
      <Breadcrumb
        currentPageLabel={PAGES.static.catalogueDesDonneesCertification.title}
        homeLinkProps={{
          href: "/",
        }}
        segments={[
          {
            label: PAGES.static.catalogueDesDonnees.title,
            linkProps: { href: PAGES.static.catalogueDesDonnees.path },
          },
        ]}
        style={{ marginBottom: fr.spacing("3w") }}
      />

      <Box sx={{ mb: fr.spacing("6w") }}>
        <DsfrLink href={PAGES.static.catalogueDesDonnees.path} arrow="left" size="lg">
          Revenir à la liste
        </DsfrLink>
      </Box>

      <CatalogueHeadline />
      <CatalogueData dictionnaire={certificationDoc} />
    </Container>
  );
}
