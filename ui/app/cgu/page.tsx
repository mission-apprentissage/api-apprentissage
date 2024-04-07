import { Container } from "@mui/material";

import Breadcrumb, { PAGES } from "../../components/breadcrumb/Breadcrumb";
import Cgu from "./components/Cgu";

const CGUPage = () => {
  return (
    <Container maxWidth="xl">
      <Breadcrumb pages={[PAGES.cgu()]} />
      <Cgu />
    </Container>
  );
};
export default CGUPage;
