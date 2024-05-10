import { Box, Container, Typography } from "@mui/material";
import { Metadata } from "next";

import { PAGES } from "../components/breadcrumb/Breadcrumb";
import { DsfrLink } from "../components/link/DsfrLink";
import { NotFound } from "../icons/NotFound";

export const metadata: Metadata = {
  title: "404",
};

export default function NotFoundPage() {
  return (
    <Container maxWidth="xl">
      <Box>
        <Box
          padding={8}
          display="flex"
          justifyContent="center"
          flexDirection="column"
          margin="auto"
          maxWidth="600px"
          textAlign="center"
        >
          <NotFound />

          <Box mt={4}>
            <Typography variant="h1" gutterBottom>
              Page non trouvée
            </Typography>

            <Typography>La page que vous recherchez n'existe pas ou a été déplacée</Typography>

            <Box mt={2}>
              <DsfrLink href={PAGES.homepage().path}>Retourner à la page d'accueil</DsfrLink>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
