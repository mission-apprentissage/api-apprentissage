"use client";

import "swagger-ui-react/swagger-ui.css";
import "./overwride.css";

import { Container, Typography } from "@mui/material";
import SwaggerUI from "swagger-ui-react";

import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { publicConfig } from "@/config.public";
import { PAGES } from "@/utils/routes.utils";

export default function TryPage() {
  return (
    <Container maxWidth="xl">
      <Breadcrumb pages={[PAGES.static.documentationTechnique, PAGES.static.documentationTechniqueEssayer]} />
      <Typography variant="h2" gutterBottom>
        {PAGES.static.documentationTechniqueEssayer.title}
      </Typography>
      <SwaggerUI url={`${publicConfig.apiEndpoint}/documentation/json`} />
    </Container>
  );
}
