import { Container } from "@mui/material";

import Breadcrumb, { PAGES } from "../../components/breadcrumb/Breadcrumb";
import PolitiqueConfidentialite from "./components/PolitiqueConfidentialite";

const PolitiqueConfidentialitePage = () => {
  return (
    <Container maxWidth="xl">
      <Breadcrumb pages={[PAGES.homepage(), PAGES.politiqueConfidentialite()]} />
      <PolitiqueConfidentialite />
    </Container>
  );
};
export default PolitiqueConfidentialitePage;
