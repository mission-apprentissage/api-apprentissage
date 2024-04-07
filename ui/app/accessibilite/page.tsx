import { Container } from "@mui/material";

import Breadcrumb, { PAGES } from "../../components/breadcrumb/Breadcrumb";
import Accessibilite from "./components/Accessibilite";

const AccessibilitePage = () => {
  return (
    <Container maxWidth="xl">
      <Breadcrumb pages={[PAGES.accessibilite()]} />
      <Accessibilite />
    </Container>
  );
};
export default AccessibilitePage;
