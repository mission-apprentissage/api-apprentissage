"use client";

import "swagger-ui-react/swagger-ui.css";
import "./overwride.css";

import { fr } from "@codegouvfr/react-dsfr";
import { Box, Container, Typography } from "@mui/material";
import { use } from "react";
import { useTranslation } from "react-i18next";
import SwaggerUI from "swagger-ui-react";

import type { PropsWithLangParams } from "@/app/i18n/settings";
import { DsfrLink } from "@/components/link/DsfrLink";
import { publicConfig } from "@/config.public";
import { PAGES } from "@/utils/routes.utils";

export default function TryPage({ params }: PropsWithLangParams) {
  const { lang } = use(params);
  const { t } = useTranslation("documentation-technique");

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: fr.spacing("6w") }}>
        <DsfrLink href={PAGES.static.documentationTechnique.getPath(lang)} arrow="left" size="lg">
          {t("try.back")}
        </DsfrLink>
      </Box>
      <Typography
        variant="h1"
        sx={{ color: fr.colors.decisions.text.label.blueEcume.default, mb: fr.spacing("3w") }}
        gutterBottom
      >
        {PAGES.static.documentationTechniqueEssayer.getTitle(lang, t)}
      </Typography>
      <SwaggerUI url={`${publicConfig.apiEndpoint}/documentation/json`} />
    </Container>
  );
}
