"use client";

import "swagger-ui-react/swagger-ui.css";
import "./overwride.css";

import { fr } from "@codegouvfr/react-dsfr";
import { Box, Container, Typography } from "@mui/material";
import SwaggerUI from "swagger-ui-react";

import { DsfrLink } from "@/components/link/DsfrLink";
import { publicConfig } from "@/config.public";
import { PAGES } from "@/utils/routes.utils";

export default function TryPage() {
  return (
    <Container maxWidth="xl">
      <Box sx={{ my: fr.spacing("6w") }}>
        <DsfrLink href={PAGES.static.documentationTechnique.path} arrow="left" size="lg">
          Revenir à la documentation technique
        </DsfrLink>
      </Box>
      <Typography
        variant="h1"
        sx={{ color: fr.colors.decisions.text.label.blueEcume.default, mb: fr.spacing("3w") }}
        gutterBottom
      >
        {PAGES.static.documentationTechniqueEssayer.title}
      </Typography>
      <SwaggerUI url={`${publicConfig.apiEndpoint}/documentation/json`} />
    </Container>
  );
}
