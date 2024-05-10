import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Box, Container, Hidden, Typography } from "@mui/material";
import Image from "next/image";
import { PropsWithChildren } from "react";

import { DsfrLink } from "@/components/link/DsfrLink";
import { PAGES } from "@/utils/routes.utils";

type DonneeCardProps = PropsWithChildren<{
  title: string;
  path: string | null;
  sources: string[];
}>;

function DonneeCard(props: DonneeCardProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      maxWidth="lg"
      border="1px solid"
      borderColor={fr.colors.decisions.border.default.grey.default}
      py={fr.spacing("3w")}
      px={fr.spacing("3w")}
      gap={fr.spacing("3w")}
    >
      <Box display="flex" gap={fr.spacing("1w")} flexDirection="column">
        <Hidden smDown>
          <Box>{props.children}</Box>
        </Hidden>
        <Typography variant="h6" style={{ textWrap: "balance" }} color={fr.colors.decisions.text.default.grey.default}>
          {props.title}
        </Typography>
        <Typography className={fr.cx("fr-text--lg")}>
          {props.path === null ? (
            <Typography
              color={fr.colors.decisions.text.disabled.grey.default}
              style={{
                textUnderlinePosition: "under",
                textDecoration: "underline",
                textDecorationColor: fr.colors.decisions.border.disabled.grey.default,
              }}
            >
              Bientôt disponible !
            </Typography>
          ) : (
            <DsfrLink href={props.path}>Documentation</DsfrLink>
          )}
        </Typography>
      </Box>
      {props.path !== null ? (
        <Box>
          <Typography color={fr.colors.decisions.text.mention.grey.default} className={fr.cx("fr-text--sm")}>
            Sources
          </Typography>
          <Box
            sx={{
              flexWrap: "wrap",
              gap: fr.spacing("1w"),
              display: "flex",
            }}
          >
            {props.sources.map((source) => (
              <Badge
                key={source}
                small
                style={{
                  backgroundColor: fr.colors.decisions.background.contrast.purpleGlycine.default,
                  color: fr.colors.decisions.text.actionHigh.purpleGlycine.default,
                }}
              >
                {source}
              </Badge>
            ))}
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}

export default function CatalogueDesDonneesPage() {
  return (
    <Container maxWidth="xl" style={{ marginTop: fr.spacing("2w"), marginBottom: fr.spacing("9w") }}>
      <Box>
        <Breadcrumb
          currentPageLabel="Catalogue des données"
          homeLinkProps={{
            href: "/",
          }}
          segments={[]}
        />
      </Box>
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        <Box
          position="relative"
          display="flex"
          alignItems="center"
          flexDirection="column"
          justifyContent="center"
          gap={fr.spacing("3w")}
        >
          <Typography variant="h1" align="center" sx={{ color: fr.colors.decisions.text.label.blueEcume.default }}>
            Catalogue des données
          </Typography>
          <Typography
            component="span"
            variant="body1"
            sx={{ color: "var(--artwork-minor-blue-ecume)", fontSize: "24px" }}
            textAlign="center"
            style={{ textWrap: "balance" }}
          >
            <strong>L’API Apprentissage centralise, enrichit</strong> et<strong> met à disposition</strong> les données
            relatives à l’ensemble de l’offre de formation en apprentissage
          </Typography>
        </Box>
      </Box>
      <Box
        my={fr.spacing("5w")}
        display="grid"
        gridTemplateColumns={["1fr", "1fr 1fr", "1fr 1fr 1fr"]}
        gap={fr.spacing("2w")}
      >
        <DonneeCard
          title="Liste des certifications réalisables en apprentissage"
          path={PAGES.static.catalogueDesDonneesCertification.path}
          sources={["BCN", "FRANCE COMPÉTENCES", "CERTIF-INFO"]}
        >
          <Image src="/asset/artwork/book.svg" alt="Illustration d'un livre ouvert" width={80} height={80} />
        </DonneeCard>
        <DonneeCard title="Opportunités d’emplois et de formations en alternance" path={null} sources={[]}>
          <Image
            src="/asset/artwork/human-cooperation.svg"
            alt="Illustration de 3 mains posées les unes sur les autres"
            width={80}
            height={80}
          />
        </DonneeCard>
        <DonneeCard title="Liste des organismes de formation en apprentissage" path={null} sources={[]}>
          <Image
            src="/asset/artwork/school.svg"
            alt="Illustration d'un établissement scolaire"
            width={80}
            height={80}
          />
        </DonneeCard>
      </Box>
      <Box sx={{ background: fr.colors.decisions.background.alt.beigeGrisGalet.default }}>
        <Container maxWidth="xl" disableGutters>
          <Box display="grid" gridTemplateColumns={["1fr", "1fr", "1fr 1fr 1fr"]} padding={{ md: fr.spacing("6w") }}>
            <Box display="flex" alignItems="center" justifyContent="center" position="relative">
              <Hidden mdDown>
                <Image
                  fill
                  src="/asset/artwork/not-found-solid-iii-0.svg"
                  alt="Illustration d'un homme qui hausse les épaules"
                />
              </Hidden>
            </Box>
            <Box
              display="grid"
              gap={fr.spacing("3w")}
              padding={fr.spacing("3w")}
              gridColumn={["span 1", "span 1", "span 2"]}
            >
              <Typography variant="h3" sx={{ color: fr.colors.decisions.text.label.blueEcume.default }}>
                Il vous manque un ou des jeu(x) de données pour répondre à vos besoins ?
              </Typography>
              <Box display="grid" gap={fr.spacing("2v")}>
                <Typography>
                  <DsfrLink href="mailto:support_api@apprentissage.beta.gouv.fr">
                    Dites le nous
                    <Box component="span" sx={{ display: "inline-block" }} mx={fr.spacing("1w")}>
                      <i className={fr.cx("fr-icon-arrow-right-line", "fr-text--lg")} />
                    </Box>
                  </DsfrLink>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Container>
  );
}
