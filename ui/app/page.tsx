import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Box, Button, Container, Hidden, Link, Typography } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { PropsWithChildren } from "react";

import { Artwork } from "@/components/artwork/Artwork";
import { DsfrLink } from "@/components/link/DsfrLink";
import { PAGES } from "@/utils/routes.utils";

function ActeurBadge({ children }: PropsWithChildren) {
  if (!children) return null;

  return (
    <Badge
      severity="info"
      style={{
        background: "var(--background-contrast-orange-terre-battue)",
        color: "var(--text-label-orange-terre-battue)",
      }}
      noIcon
    >
      {children}
    </Badge>
  );
}

function VousEtesSection() {
  return (
    <Container maxWidth="xl" sx={{ overflowX: "clip" }} disableGutters>
      <Box my={fr.spacing("9w")} display="grid" gridTemplateColumns="1fr auto 1fr" overflow="visible" maxWidth="100vw">
        <Box position="relative">
          <Hidden mdDown>
            <Box position="absolute" right="35px" top="35px">
              <Artwork name="thinking-woman-2" />
            </Box>
          </Hidden>
        </Box>
        <Box
          position="relative"
          display="flex"
          alignItems="center"
          flexDirection="column"
          gap={fr.spacing("3w")}
          maxWidth="720px"
        >
          <Typography variant="h1" align="center" sx={{ color: fr.colors.decisions.text.label.blueEcume.default }}>
            Vous êtes ?
          </Typography>
          <Box
            display="flex"
            justifyContent="center"
            textAlign="center"
            rowGap="12px"
            columnGap="12px"
            maxWidth="720px"
            flexWrap="wrap"
          >
            <ActeurBadge>un opérateur public</ActeurBadge>
            <ActeurBadge>un organisme de formation</ActeurBadge>
            <ActeurBadge>une entreprise</ActeurBadge>
            <ActeurBadge>un editeur de logiciels</ActeurBadge>
            <ActeurBadge>un organisme financeur</ActeurBadge>
            <ActeurBadge>un apprenant / une apprenante</ActeurBadge>
          </Box>
          <Box textAlign="center">
            <Typography
              component="span"
              variant="body1"
              sx={{ color: fr.colors.decisions.text.label.blueEcume.default, fontSize: "24px" }}
            >
              L’<strong>API Apprentissage</strong>
            </Typography>
            <Typography
              component="span"
              variant="body1"
              sx={{ color: "var(--artwork-minor-blue-ecume)", fontSize: "24px" }}
            >
              &nbsp;est le <strong>point d’entrée unique</strong> et documenté pour <strong>faciliter l’accès</strong> à
              toutes les <strong>données relatives à l’apprentissage</strong>
            </Typography>
          </Box>

          <Link component={NextLink} href={PAGES.static.catalogueDesDonnees.path}>
            <Button size="large" variant="contained">
              Consulter le catalogue des données
              <Box component="span" sx={{ display: "inline-block" }} mx={fr.spacing("1w")}>
                <i className={fr.cx("fr-icon-arrow-right-line", "fr-text--lg")} />
              </Box>
            </Button>
          </Link>
        </Box>
        <Box position="relative">
          <Hidden mdDown>
            <Box position="absolute" top="-35px">
              <Artwork name="solide_II" />
            </Box>
          </Hidden>
        </Box>

        <Box gridColumn="span 3" display="grid" gridTemplateColumns="1fr 1fr" height="98px">
          <Box position="relative">
            <Box position="absolute" right="280px" top="-70px">
              <Artwork name="designer" />
            </Box>
          </Box>
          <Box position="relative">
            <Box position="absolute" left="240px" top="-30px">
              <Artwork name="man" />
            </Box>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}

function CommentUtiliserApiSection() {
  return (
    <Box sx={{ background: fr.colors.decisions.background.alt.beigeGrisGalet.default }}>
      <Container maxWidth="xl" disableGutters>
        <Box display="grid" gridTemplateColumns={{ sm: "1fr", md: "1fr 1fr" }} padding={{ md: fr.spacing("6w") }}>
          <Box display="flex" alignItems="center" justifyContent="center" position="relative">
            <Hidden mdDown>
              <Image
                fill
                src="/asset/artwork/brainstorming.svg"
                alt="Illustration d'un groupe de personnes faisant une réunion de travail autour d'un tableau"
              />
            </Hidden>
          </Box>
          <Box display="grid" gap={fr.spacing("3w")} padding={fr.spacing("3w")}>
            <Typography variant="h2" sx={{ color: fr.colors.decisions.text.label.blueEcume.default }}>
              Comment utiliser l’API ?
            </Typography>
            <Typography>
              L’API est ouverte à tous et à toutes, <strong>créez votre compte</strong> pour obtenir et gérer{" "}
              <strong>vos jetons d’accès !</strong>
            </Typography>
            <Box display="grid" gap={fr.spacing("2v")}>
              <Typography>
                <DsfrLink href={PAGES.static.compteProfil.path}>Créer mon compte</DsfrLink>
              </Typography>

              <Typography>
                <DsfrLink href={PAGES.static.documentationTechnique.path}>
                  Consulter la documentation technique
                </DsfrLink>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

function ProtectionDesDonneeSection() {
  return (
    <Box sx={{ background: fr.colors.decisions.background.alt.blueEcume.default }}>
      <Container maxWidth="xl" disableGutters>
        <Box display="grid" gridTemplateColumns={{ sm: "1fr", md: "1fr 1fr" }} padding={{ md: fr.spacing("6w") }}>
          <Box display="grid" gap={fr.spacing("3w")} padding={fr.spacing("3w")}>
            <Typography variant="h2" sx={{ color: fr.colors.decisions.text.label.blueEcume.default }}>
              Protection des données
            </Typography>
            <Typography>
              L’API apprentissage est construite dans le <strong>respect strict de la vie privée des personnes</strong>{" "}
              et <strong>applique les standards de sécurité de l'État.</strong>
            </Typography>
            <Box display="grid" gap={fr.spacing("2v")}>
              <Typography>
                <DsfrLink href={PAGES.static.politiqueConfidentialite.path}>
                  Notre politique de confidentialité
                </DsfrLink>
              </Typography>

              <Typography>
                <DsfrLink href={PAGES.static.donneesPersonnelles.path}>
                  Protection des données à caractère personnel
                </DsfrLink>
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center" position="relative">
            <Hidden mdDown>
              <Artwork name="data-security" />
            </Hidden>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default function Home() {
  return (
    <>
      <VousEtesSection />
      <CommentUtiliserApiSection />
      <ProtectionDesDonneeSection />
    </>
  );
}
