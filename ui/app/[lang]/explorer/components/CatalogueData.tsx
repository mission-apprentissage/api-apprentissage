import { fr } from "@codegouvfr/react-dsfr";
import { Box, Container, Hidden, Typography } from "@mui/material";
import type { DocBusinessField, DocModel } from "api-alternance-sdk/internal";
import { getTextOpenAPI } from "api-alternance-sdk/internal";
import Markdown from "react-markdown";

import type { WithLang, WithLangAndT } from "@/app/i18n/settings";
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

function DsfrMarkdown({ children }: { children: string | null | undefined }) {
  return (
    <Markdown
      components={{
        p: ({ children }) => <Box>{children}</Box>,
        a: ({ children, href }) => (
          <DsfrLink href={href ?? ""} arrow="none">
            {children}
          </DsfrLink>
        ),
        code: ({ children }) => {
          return children ? <Tag color="beigeGrisGalet">{children}</Tag> : null;
        },
      }}
    >
      {children}
    </Markdown>
  );
}

function InformationBox({ information, lang, t }: WithLangAndT<Pick<DocBusinessField, "information">>) {
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
            <strong>{t("information", { lng: lang })}</strong>
          </Typography>
        </Box>
        <DsfrMarkdown>{getTextOpenAPI(information, lang)}</DsfrMarkdown>
      </Box>
    </Box>
  );
}

function DataField({ name, field, lang, t }: WithLangAndT<{ name: string; field: DocBusinessField }>) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: threeColumns,
        gap: { md: fr.spacing("2w"), lg: fr.spacing("9w") },
        flexDirection: "column",
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
        <Box>
          <Tag color="beigeGrisGalet">{name}</Tag>
        </Box>
        <Box sx={{ gridColumn: "span 3", display: "flex", gap: fr.spacing("1w"), flexDirection: "column" }}>
          {field.sample !== null && (
            <Typography
              sx={{
                color: fr.colors.decisions.text.mention.grey.default,
              }}
            >
              {getTextOpenAPI(field.sample, lang)}
            </Typography>
          )}
          <DsfrMarkdown>{getTextOpenAPI(field.description, lang)}</DsfrMarkdown>
          {field.tags != null ? (
            <Box sx={{ display: "flex", gap: fr.spacing("1w"), flexWrap: "wrap" }}>
              {field.tags.map((tag) => (
                <Tag color="beigeGrisGalet" key={tag}>
                  {tag}
                </Tag>
              ))}
            </Box>
          ) : null}
        </Box>
        <GoodToKnow tip={field.tip} lang={lang} />
        <Box component="hr" sx={{ gridColumn: "1/-1", padding: 0, height: "1px" }} />
      </Box>
      <InformationBox information={field.information} lang={lang} t={t} />
    </Box>
  );
}

function DataTypologie({ name, field, lang, t }: WithLangAndT<{ name: string; field: DocBusinessField }>) {
  return (
    <Box sx={{ display: "flex", gap: fr.spacing("1w"), flexDirection: "column" }}>
      <Typography variant="h6">{getTextOpenAPI(field.section, lang)}</Typography>
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
      <DataField key={name} name={name} field={field} lang={lang} t={t} />
      {field._ == null
        ? null
        : Object.entries(field._).map(([key, childField]) =>
            "metier" in childField && childField.metier ? (
              <DataField key={key} name={key} field={childField} lang={lang} t={t} />
            ) : null
          )}
    </Box>
  );
}

function DataSection({ model, lang, t }: WithLangAndT<{ model: DocModel }>) {
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
        {t("donneesCatalogue.titre", { lng: lang })}
      </Typography>
      {Object.entries(model._).map(([key, field]) => (
        <DataTypologie key={key} name={key} field={field} lang={lang} t={t} />
      ))}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: threeColumns,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gridColumn: spanTwoColumns,
            gap: fr.spacing("2w"),
            alignItems: "center",
          }}
        >
          <Artwork name="designer" height={80} />
          <Typography sx={{ textWrap: "balance" }} className={fr.cx("fr-text--lead")}>
            <strong>{t("besoinDonnees.titre", { lng: lang })}</strong>
          </Typography>
          <DsfrLink href={PAGES.static.documentationTechnique.path} size="lg">
            {t("besoinDonnees.swagger", { lng: lang })}
          </DsfrLink>
        </Box>
      </Box>
    </Box>
  );
}

function ContactSection({ t, lang }: WithLangAndT) {
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
              {t("besoinDonnees.donneesManquantes", { lng: lang })}
            </Typography>
            <Box display="grid" gap={fr.spacing("2v")}>
              <Typography>
                <DsfrLink href="mailto:support_api@apprentissage.beta.gouv.fr">
                  {t("besoinDonnees.ditesLeNous", { lng: lang })}
                </DsfrLink>
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

export function CatalogueData({ model, lang, t }: WithLangAndT<{ model: DocModel }>) {
  return (
    <>
      <DataSection model={model} lang={lang} t={t} />
      <ContactSection lang={lang} t={t} />
    </>
  );
}
