import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Box, Container } from "@mui/material";

import { DsfrLink } from "@/components/link/DsfrLink";
import { PAGES } from "@/utils/routes.utils";

import { SimulateurNpecContrat } from "./components/SimulateurNpecContrat";
import { SimulateurNpecHeadline } from "./components/SimulateurNpecHeadline";

export default function SimulateurNpecPage() {
  return (
    <Container maxWidth="xl" sx={{ marginTop: fr.spacing("2w"), marginBottom: fr.spacing("9w") }}>
      <Breadcrumb
        currentPageLabel={PAGES.static.simulateurNpec.title}
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

      <Container maxWidth="lg">
        <SimulateurNpecHeadline />
        <SimulateurNpecContrat />
      </Container>
    </Container>
  );
}
