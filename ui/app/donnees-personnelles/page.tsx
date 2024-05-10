import { Container } from "@mui/material";

import Breadcrumb, { PAGES } from "@/components/breadcrumb/Breadcrumb";

import DonneesPersonnelles from "./components/DonneesPersonnelles";

const DonneesPersonnellesPage = () => {
  return (
    <Container maxWidth="xl">
      <Breadcrumb pages={[PAGES.static.donneesPersonnelles]} />
      <DonneesPersonnelles />
    </Container>
  );
};
export default DonneesPersonnellesPage;
