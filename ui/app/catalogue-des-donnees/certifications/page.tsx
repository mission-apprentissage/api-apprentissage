import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Box, Container } from "@mui/material";
import { certificationDoc } from "shared/docs/certification/certification.doc";

import { PAGES } from "@/utils/routes.utils";

import { CatalogueData } from "./components/CatalogueData";
import { CatalogueHeadline } from "./components/CatalogueDonneeHeadline";

export default function CatalogueCertificationPage() {
  return (
    <Container maxWidth="xl" sx={{ marginTop: fr.spacing("2w"), marginBottom: fr.spacing("9w") }}>
      <Box>
        <Breadcrumb
          currentPageLabel="Liste des certifications réalisables en apprentissage"
          homeLinkProps={{
            href: "/",
          }}
          segments={[{ label: "Catalogue des données", linkProps: { href: PAGES.static.catalogueDesDonnees.path } }]}
        />
      </Box>

      <CatalogueHeadline />
      <CatalogueData dictionnaire={certificationDoc} />
    </Container>
  );
}
