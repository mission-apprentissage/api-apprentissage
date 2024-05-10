import { Container } from "@mui/material";

import Breadcrumb, { PAGES } from "@/components/breadcrumb/Breadcrumb";

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
