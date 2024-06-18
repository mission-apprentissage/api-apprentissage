import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Container } from "@mui/material";

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
        segments={[]}
        style={{ marginBottom: fr.spacing("3w") }}
      />
      <Container maxWidth="lg">
        <SimulateurNpecHeadline />
        <SimulateurNpecContrat />
      </Container>
    </Container>
  );
}
