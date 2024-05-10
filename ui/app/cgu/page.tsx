import { Container } from "@mui/material";

import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { PAGES } from "@/utils/routes.utils";

import Cgu from "./components/Cgu";

const CGUPage = () => {
  return (
    <Container maxWidth="xl">
      <Breadcrumb pages={[PAGES.static.cgu]} />
      <Cgu />
    </Container>
  );
};
export default CGUPage;
