import { fr } from "@codegouvfr/react-dsfr";
import { Box, Container, Hidden, Typography } from "@mui/material";
import Markdown from "react-markdown";
import { DocDictionary, DocField, DocTopologie } from "shared/docs/types";

import { Artwork } from "@/components/artwork/Artwork";
import { DsfrLink } from "@/components/link/DsfrLink";
import { Tag } from "@/components/tag/Tag";
import { PAGES } from "@/utils/routes.utils";

import { GoodToKnow } from "./GoodToKnow";

const threeColumns = {
  md: "1fr",
  lg: "1fr 1fr 1fr",
  gap: fr.spacing("9w"),
};

const spanTwoColumns = {
  md: "span 1",
  lg: "span 2",
};

function InformationBox({ information }: Pick<DocField, "information">) {
  if (!information) return null;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: fr.spacing("1w"),
          flexWrap: "wrap",
          backgroundColor: fr.colors.decisions.background.alt.blueEcume.default,
          padding: fr.spacing("2w"),
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: fr.spacing("3v"),
            alignItems: "center",
          }}
        >
          <Artwork name="avatar" />
          <Typography
            sx={{
              color: fr.colors.decisions.artwork.major.blueEcume.active,
            }}
          >
            <strong>Information</strong>
          </Typography>
        </Box>
        <Markdown
          components={{
            p: ({ children }) => <Typography>{children}</Typography>,
            a: ({ children, href }) => (
              <DsfrLink href={href ?? ""} arrow="none">
                {children}
              </DsfrLink>
            ),
          }}
        >
          {information}
        </Markdown>
      </Box>
    </Box>
  );
}

function DataField({ field }: { field: DocField }) {
  return (
    <Box
      sx={{
        display: "grid",
        gridColumn: spanTwoColumns,
        gridTemplateColumns: { sm: "1fr", md: "repeat(4, 1fr)" },
        gap: fr.spacing("2w"),
      }}
    >
      <Box>
        <Tag color="beigeGrisGalet">{field.name}</Tag>
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
        <Markdown
          components={{
            p: ({ children }) => <Typography>{children}</Typography>,
            a: ({ children, href }) => (
              <DsfrLink href={href ?? ""} arrow="none">
                {children}
              </DsfrLink>
            ),
          }}
        >
          {field.description}
        </Markdown>
        <Box sx={{ display: "flex", gap: fr.spacing("1w"), flexWrap: "wrap" }}>
          {field.tags.map((tag) => (
            <Tag color="beigeGrisGalet" key={tag}>
              {tag}
            </Tag>
          ))}
        </Box>
      </Box>
      <GoodToKnow tip={field.tip} />
      <Box component="hr" sx={{ gridColumn: "1/-1", padding: 0, height: "1px" }} />
    </Box>
  );
}

function DataTypologie({ typologie }: { typologie: DocTopologie }) {
  return (
    <Box sx={{ display: "flex", gap: fr.spacing("1w"), flexDirection: "column" }}>
      <Typography variant="h6">{typologie.name}</Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: threeColumns,
          gap: fr.spacing("9w"),
          flexDirection: "column",
        }}
      >
        <Box component="hr" sx={{ gridColumn: "1/3", padding: 0, height: "1px" }} />
      </Box>
      {Object.entries(typologie.fields).map(([name, field]) => (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: threeColumns,
            gap: { md: fr.spacing("2w"), lg: fr.spacing("9w") },
            flexDirection: "column",
          }}
          key={name}
        >
          <DataField field={field} />
          <InformationBox information={field.information} />
        </Box>
      ))}
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
          <Artwork name="designer" />
          <Box sx={{ display: "flex", alignItems: "center", gridColumn: { sm: "span 1", md: "span 3" } }}>
            <Typography sx={{ textWrap: "balance" }}>
              <strong>Besoin de ces données pour votre projet ? </strong>
              <DsfrLink href={PAGES.static.documentationTechnique.path}>Consulter le swagger</DsfrLink>
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
                <DsfrLink href="mailto:support_api@apprentissage.beta.gouv.fr">Dites le nous</DsfrLink>
              </Typography>
            </Box>
          </Box>
          <Box display="flex" alignItems="center" justifyContent="center" position="relative">
            <Hidden mdDown>
              <Artwork name="not-found-solid-iii-0" />
            </Hidden>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export function CatalogueData({ dictionnaire }: { dictionnaire: DocDictionary }) {
  return (
    <>
      <DataSection dictionnaire={dictionnaire} />
      <ContactSection />
    </>
  );
}
