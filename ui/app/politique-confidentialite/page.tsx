import { Container } from "@mui/material";

import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { PAGES } from "@/utils/routes.utils";

import PolitiqueConfidentialite from "./components/PolitiqueConfidentialite";

const PolitiqueConfidentialitePage = () => {
  return (
    <Container maxWidth="xl">
      <Breadcrumb pages={[PAGES.static.home, PAGES.static.politiqueConfidentialite]} />
      <PolitiqueConfidentialite />
    </Container>
  );
};
export default PolitiqueConfidentialitePage;
