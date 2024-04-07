import { Container } from "@mui/material";

import Breadcrumb, { PAGES } from "../../components/breadcrumb/Breadcrumb";
import MentionsLegales from "./components/MentionLegales";

const MentionsLegalesPage = () => {
  return (
    <Container maxWidth="xl">
      <Breadcrumb pages={[PAGES.mentionsLegales()]} />
      <MentionsLegales />
    </Container>
  );
};
export default MentionsLegalesPage;
