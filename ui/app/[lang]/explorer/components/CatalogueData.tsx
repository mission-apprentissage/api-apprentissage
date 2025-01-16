import { fr } from "@codegouvfr/react-dsfr";
import { Tabs } from "@codegouvfr/react-dsfr/Tabs";
import { Box, Container, Hidden, Typography } from "@mui/material";
import type { DocDatum, DocModelRow, DocModelSection, DocPage } from "api-alternance-sdk/internal";
import { getTextOpenAPI, openapiSpec } from "api-alternance-sdk/internal";

import type { WithLangAndT } from "@/app/i18n/settings";
import { Artwork } from "@/components/artwork/Artwork";
import { DsfrLink } from "@/components/link/DsfrLink";
import { DsfrMarkdown } from "@/components/markdown/DsfrMarkdown";
import { Tag } from "@/components/tag/Tag";
import { PAGES } from "@/utils/routes.utils";

import { GoodToKnow } from "./GoodToKnow";
import { SwaggerLink } from "./SwaggerLink";

const threeColumns = {
  md: "1fr",
  lg: "1fr 1fr 1fr",
  gap: fr.spacing("9w"),
};

const spanTwoColumns = {
  md: "span 1",
  lg: "span 2",
};

type Props = WithLangAndT<{ doc: DocPage }>;

function InformationBox({ information, lang, t }: WithLangAndT<Pick<DocModelRow, "information">>) {
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

function DataField({ name, row, lang, t, noHr }: WithLangAndT<{ name: string; row: DocModelRow; noHr: boolean }>) {
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
          {row.sample !== null && (
            <Typography
              sx={{
                color: fr.colors.decisions.text.mention.grey.default,
              }}
            >
              {getTextOpenAPI(row.sample, lang)}
            </Typography>
          )}
          <DsfrMarkdown>{getTextOpenAPI(row.description, lang)}</DsfrMarkdown>
          {row.tags != null ? (
            <Box sx={{ display: "flex", gap: fr.spacing("1w"), flexWrap: "wrap" }}>
              {row.tags.map((tag) => (
                <Tag color="beigeGrisGalet" key={tag}>
                  {tag}
                </Tag>
              ))}
            </Box>
          ) : null}
        </Box>
        <GoodToKnow tip={row.tip} lang={lang} />
        {noHr ? null : <Box component="hr" sx={{ gridColumn: "1/-1", padding: 0, height: "1px" }} />}
      </Box>
      <InformationBox information={row.information} lang={lang} t={t} />
    </Box>
  );
}

function DataRows({ rows, lang, t, noHr }: WithLangAndT<{ rows: Record<string, DocModelRow>; noHr: boolean }>) {
  const rowList: [string, DocModelRow][] = Object.entries(rows);

  return (
    <>
      {rowList.map(([key, row], i) => (
        <DataField key={key} name={key} row={row} lang={lang} t={t} noHr={noHr && i === rowList.length - 1} />
      ))}
    </>
  );
}

function DataTypologie({ section, lang, t, noHr }: WithLangAndT<{ section: DocModelSection; noHr: boolean }>) {
  return (
    <Box sx={{ display: "flex", gap: fr.spacing("1w"), flexDirection: "column" }}>
      <Typography variant="h6">{getTextOpenAPI(section.name, lang)}</Typography>
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
      <DataRows rows={section.rows} lang={lang} t={t} noHr={noHr} />
    </Box>
  );
}

function DataModelVariant({ datum, lang, t, tab }: WithLangAndT<{ datum: DocDatum; tab: boolean }>) {
  const entries = Object.entries(datum.sections);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: fr.spacing("4w"),
      }}
    >
      {entries.map(([key, section], i) => (
        <DataTypologie key={key} section={section} lang={lang} t={t} noHr={tab && i === entries.length - 1} />
      ))}
    </Box>
  );
}

function DataSection({ doc, lang, t }: Props) {
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
      {doc.data.length === 1 ? (
        <DataModelVariant datum={doc.data[0]} lang={lang} t={t} tab={false} />
      ) : (
        <Tabs
          tabs={doc.data.map((datum, i) => {
            return {
              isDefault: i === 0,
              label: getTextOpenAPI(datum.name, lang),
              content: <DataModelVariant datum={datum} lang={lang} t={t} tab />,
            };
          })}
        />
      )}
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
          <SwaggerLink lang={lang} doc={doc} />
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

export function CatalogueData({ doc, lang, t }: Props) {
  return (
    <>
      <DataSection doc={doc} lang={lang} t={t} />
      <ContactSection lang={lang} t={t} />
    </>
  );
}
