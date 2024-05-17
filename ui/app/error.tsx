"use client";

import Button from "@codegouvfr/react-dsfr/Button";
import { Box, Container, Typography } from "@mui/material";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

import { DsfrLink } from "@/components/link/DsfrLink";
import { NotFound } from "@/icons/NotFound";
import { PAGES } from "@/utils/routes.utils";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
    console.error(error);
  }, [error]);

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
              Une erreur est survenue
            </Typography>

            <Box mt={2}>
              <Button onClick={() => reset()} type="button">
                Essayer à nouveau
              </Button>
            </Box>

            <Box mt={2}>
              <DsfrLink href={PAGES.static.home.path}>Retourner à la page d'accueil</DsfrLink>
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
