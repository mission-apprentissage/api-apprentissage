import { fr } from "@codegouvfr/react-dsfr";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { Box, Container, Hidden, Link, Typography } from "@mui/material";
import Image from "next/image";
import NextLink from "next/link";
import { Fragment } from "react";
import Markdown from "react-markdown";
import { certificationDoc } from "shared/docs/certification/certification.doc";
import { DocDictionary, DocField, DocTopologie } from "shared/docs/types";

import { PAGES } from "../../../components/breadcrumb/Breadcrumb";

const threeColumns = {
  md: "1fr",
  lg: "1fr 1fr 1fr",
  gap: fr.spacing("9w"),
};

const spanTwoColumns = {
  md: "span 1",
  lg: "span 2",
};

function HeaderSection() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: threeColumns,
        marginBottom: fr.spacing("6w"),
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: fr.spacing("2w"),
          gridColumn: spanTwoColumns,
        }}
      >
        <Typography variant="h1" sx={{ color: fr.colors.decisions.text.label.blueEcume.default }}>
          Liste des certifications réalisables en apprentissage
        </Typography>

        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexWrap: "wrap",
            gap: fr.spacing("2w"),
          }}
        >
          <Typography component="span" variant="body1">
            <strong>Fréquence de mise à jour :</strong>{" "}
            <Badge
              small
              style={{
                backgroundColor: fr.colors.decisions.background.alt.blueEcume.default,
                color: fr.colors.decisions.text.actionHigh.blueEcume.default,
              }}
            >
              TOUS LES JOURS
            </Badge>
          </Typography>
          {/* <Typography component="span" variant="body1">
            <strong>Dernière mise à jour :</strong>{" "}
            <Badge
              small
              style={{
                backgroundColor: fr.colors.decisions.background.alt.blueEcume.default,
                color: fr.colors.decisions.text.actionHigh.blueEcume.default,
              }}
            >
              le Date du jour
            </Badge>
          </Typography> */}
        </Box>

        <Typography
          sx={{
            marginTop: fr.spacing("1w"),
            textWrap: "balance",
          }}
          className={fr.cx("fr-text--lead")}
        >
          <strong>Utilisez un jeu de données fiable et enrichi pour votre projet :</strong> codification, période de
          validité, intitulé, domaines, continuité, type et base légale.
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: fr.spacing("1w") }}>
          <Image
            src="/asset/artwork/designer.svg"
            alt="Illustration d'une designeuse qui présente un projet sur un écran"
            width={124}
            height={126}
          />
          <Typography sx={{ textWrap: "balance" }}>
            <strong>Besoin de ces données pour votre projet ?</strong>
          </Typography>
          <Typography>
            <Link
              component={NextLink}
              href={PAGES.documentationTechnique().path}
              sx={{ textUnderlinePosition: "under" }}
            >
              Consulter le swagger
              <Box component="span" sx={{ display: "inline-block" }} mx={fr.spacing("1w")}>
                <i className={fr.cx("fr-icon-arrow-right-line", "fr-text--lg")} />
              </Box>
            </Link>
          </Typography>
          <Typography>
            <Link component={NextLink} href={PAGES.compteProfil().path} sx={{ textUnderlinePosition: "under" }}>
              Obtenir un jeton d’accès
              <Box component="span" sx={{ display: "inline-block" }} mx={fr.spacing("1w")}>
                <i className={fr.cx("fr-icon-arrow-right-line", "fr-text--lg")} />
              </Box>
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

function Tag({ children }: { children: string }) {
  return (
    <Badge
      small
      style={{
        color: fr.colors.decisions.background.flat.beigeGrisGalet.default,
        backgroundColor: fr.colors.decisions.background.contrast.beigeGrisGalet.default,
      }}
    >
      {children}
    </Badge>
  );
}

function DataField({ field }: { field: DocField }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { sm: "1fr", md: "repeat(4, 1fr)" },
        gap: fr.spacing("2w"),
      }}
    >
      <Box>
        <Tag>{field.name}</Tag>
      </Box>
      <Box sx={{ gridColumn: "span 3", display: "flex", gap: fr.spacing("1w"), flexDirection: "column" }}>
        {field.sample !== null && (
          <Typography
            sx={{
              color: fr.colors.decisions.text.mention.grey.default,
            }}
          >
            {field.sample}
          </Typography>
        )}
        <Markdown components={{ p: ({ children }) => <Typography>{children}</Typography> }}>
          {field.description}
        </Markdown>
        <Box sx={{ display: "flex", gap: fr.spacing("1w"), flexWrap: "wrap" }}>
          {field.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

function DataTypologie({ typologie }: { typologie: DocTopologie }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: threeColumns,
        gap: fr.spacing("2w"),
      }}
    >
      <Box sx={{ gridColumn: spanTwoColumns, display: "flex", gap: fr.spacing("1w"), flexDirection: "column" }}>
        <Typography variant="h6">{typologie.name}</Typography>
        <Box component="hr" sx={{ padding: 0, height: "1px" }} />
        {Object.entries(typologie.fields).map(([name, field]) => (
          <Fragment key={name}>
            <DataField field={field} />
            <Box component="hr" sx={{ padding: 0, height: "1px" }} />
          </Fragment>
        ))}
      </Box>
    </Box>
  );
}

function DataSection({ dictionnaire }: { dictionnaire: DocDictionary }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: fr.spacing("4w"),
        marginY: fr.spacing("6w"),
      }}
    >
      <Typography variant="h2" sx={{ color: fr.colors.decisions.artwork.minor.blueEcume.default }}>
        Détail des données
      </Typography>
      {Object.entries(dictionnaire).map(([key, typologie]) => (
        <DataTypologie key={key} typologie={typologie} />
      ))}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: threeColumns,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridColumn: spanTwoColumns,
            gridTemplateColumns: { sm: "1fr", md: "repeat(4, 1fr)" },
            gap: fr.spacing("2w"),
          }}
        >
          <Image
            src="/asset/artwork/designer.svg"
            alt="Illustration d'une designeuse qui présente un projet sur un écran"
            width={124}
            height={126}
          />
          <Box sx={{ display: "flex", alignItems: "center", gridColumn: { sm: "span 1", md: "span 3" } }}>
            <Typography sx={{ textWrap: "balance" }}>
              <strong>Besoin de ces données pour votre projet ? </strong>
              <Link
                component={NextLink}
                href={PAGES.documentationTechnique().path}
                sx={{ textUnderlinePosition: "under" }}
              >
                Consulter le swagger
                <Box component="span" sx={{ display: "inline-block" }} mx={fr.spacing("1w")}>
                  <i className={fr.cx("fr-icon-arrow-right-line", "fr-text--lg")} />
                </Box>
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function ContactSection() {
  return (
    <Box sx={{ background: fr.colors.decisions.background.alt.beigeGrisGalet.default }}>
      <Container maxWidth="xl" disableGutters>
        <Box display="grid" gridTemplateColumns={threeColumns} padding={{ md: fr.spacing("6w") }}>
          <Box
            sx={{
              display: "grid",
              gap: fr.spacing("3w"),
              padding: fr.spacing("3w"),
              gridColumn: spanTwoColumns,
            }}
          >
            <Typography
              variant="h3"
              sx={{ color: fr.colors.decisions.text.label.blueEcume.default, textWrap: "balance" }}
            >
              Il vous manque une ou plusieurs donnée(s) pour répondre à vos besoins ?
            </Typography>
            <Box display="grid" gap={fr.spacing("2v")}>
              <Typography>
                <Link
                  component={NextLink}
                  href="mailto:support_api@apprentissage.beta.gouv.fr"
                  style={{
                    textUnderlinePosition: "under",
                  }}
                >
                  Dites le nous
                  <Box component="span" sx={{ display: "inline-block" }} mx={fr.spacing("1w")}>
                    <i className={fr.cx("fr-icon-arrow-right-line", "fr-text--lg")} />
                  </Box>
                </Link>
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center" position="relative">
            <Hidden mdDown>
              <Image
                fill
                src="/asset/artwork/not-found-solid-iii-0.svg"
                alt="Illustration d'un homme qui hausse les épaules"
              />
            </Hidden>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default function DocMetierCertificationPage() {
  return (
    <Container maxWidth="xl" sx={{ marginTop: fr.spacing("2w"), marginBottom: fr.spacing("9w") }}>
      <Box>
        <Breadcrumb
          currentPageLabel="Liste des certifications réalisables en apprentissage"
          homeLinkProps={{
            href: "/",
          }}
          segments={[{ label: "Catalogue des données", linkProps: { href: PAGES.catalogueDesDonnees().path } }]}
        />
      </Box>

      <HeaderSection />
      <DataSection dictionnaire={certificationDoc} />
      <ContactSection />
    </Container>
  );
}
