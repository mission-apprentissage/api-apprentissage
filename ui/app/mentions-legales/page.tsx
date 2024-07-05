import { Container } from "@mui/material";

import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { PAGES } from "@/utils/routes.utils";

import MentionsLegales from "./components/MentionLegales";

const MentionsLegalesPage = () => {
  return (
    <Container maxWidth="xl">
      <Breadcrumb pages={[PAGES.static.mentionsLegales]} />
      <MentionsLegales />
    </Container>
  );
};
export default MentionsLegalesPage;
