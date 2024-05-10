import { Container } from "@mui/material";

import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { PAGES } from "@/utils/routes.utils";

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
