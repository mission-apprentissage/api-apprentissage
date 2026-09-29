import { fr } from "@codegouvfr/react-dsfr"
import { Badge } from "@codegouvfr/react-dsfr/Badge"
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb"
import house from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/buildings/house.svg"
import school from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/buildings/school.svg"
import internet from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/digital/internet.svg"
import search from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/digital/search.svg"
import contract from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/document/contract.svg"
import book from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/leisure/book.svg"
import community from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/leisure/community.svg"
import locationFrance from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/map/location-france.svg"
import { Tag as TagDsfr } from "@codegouvfr/react-dsfr/Tag"
import { Tile } from "@codegouvfr/react-dsfr/Tile"
import { Box, Container, Typography } from "@mui/material"
import type { DocPage, OpenApiText } from "api-alternance-sdk/internal"
import {
  CONTACT_EMAIL,
  candidatureOffrePageDoc,
  candidatureOffrePageSummaryDoc,
  certificationsPageDoc,
  certificationsPageSummaryDoc,
  depotOffrePageDoc,
  depotOffrePageSummaryDoc,
  generationLienPriseRdvFormationPageDoc,
  generationLienPriseRdvFormationPageSummaryDoc,
  getTextOpenAPI,
  rechercheCommunePageDoc,
  rechercheCommunePageSummaryDoc,
  rechercheFormationPageDoc,
  rechercheFormationPageSummaryDoc,
  rechercheOffrePageDoc,
  rechercheOffrePageSummaryDoc,
  recuperationDepartementsPageDoc,
  recuperationDepartementsPageSummaryDoc,
  recuperationDetailOffrePageDoc,
  recuperationDetailOffrePageSummaryDoc,
  recuperationFormationPageDoc,
  recuperationFormationPageSummaryDoc,
  recuperationMissionLocalePageSummaryDoc,
  recuperationMissionLocalesPageDoc,
  recuperationOrganismesPageDoc,
  recuperationOrganismesPageSummaryDoc,
} from "api-alternance-sdk/internal"
import type { CSSProperties } from "react"

import { getServerTranslation } from "@/app/i18n"
import type { PropsWithLangParams } from "@/app/i18n/settings"
import { Artwork } from "@/components/artwork/Artwork"
import { DsfrLink } from "@/components/link/DsfrLink"
import type { IPage } from "@/utils/routes.utils"
import { PAGES } from "@/utils/routes.utils"

// Tag et badge dérivés de la page détail (doc.type, doc.habilitation) : la tuile ne peut pas la contredire
type ExplorerTile = {
  summary: { title: OpenApiText; headline: OpenApiText }
  doc: DocPage
  page: IPage
  imageUrl: string
  style?: CSSProperties
}

const tiles: ExplorerTile[] = [
  { summary: rechercheOffrePageSummaryDoc, doc: rechercheOffrePageDoc, page: PAGES.static.rechercheOffre, imageUrl: search.src },
  { summary: recuperationDetailOffrePageSummaryDoc, doc: recuperationDetailOffrePageDoc, page: PAGES.static.recuperationDetailOffre, imageUrl: search.src },
  { summary: depotOffrePageSummaryDoc, doc: depotOffrePageDoc, page: PAGES.static.depotOffre, imageUrl: internet.src },
  { summary: candidatureOffrePageSummaryDoc, doc: candidatureOffrePageDoc, page: PAGES.static.candidatureOffre, imageUrl: contract.src },
  { summary: rechercheFormationPageSummaryDoc, doc: rechercheFormationPageDoc, page: PAGES.static.rechercheFormation, imageUrl: search.src },
  { summary: recuperationFormationPageSummaryDoc, doc: recuperationFormationPageDoc, page: PAGES.static.recuperationFormation, imageUrl: search.src },
  {
    summary: generationLienPriseRdvFormationPageSummaryDoc,
    doc: generationLienPriseRdvFormationPageDoc,
    page: PAGES.static.generationLienPriseRdvFormation,
    imageUrl: community.src,
  },
  {
    summary: certificationsPageSummaryDoc,
    doc: certificationsPageDoc,
    page: PAGES.static.catalogueDesDonneesCertification,
    imageUrl: book.src,
    style: { color: fr.colors.decisions.text.title.grey.default },
  },
  { summary: recuperationOrganismesPageSummaryDoc, doc: recuperationOrganismesPageDoc, page: PAGES.static.recuperationOrganismes, imageUrl: school.src },
  { summary: rechercheCommunePageSummaryDoc, doc: rechercheCommunePageDoc, page: PAGES.static.rechercheCommune, imageUrl: search.src },
  { summary: recuperationDepartementsPageSummaryDoc, doc: recuperationDepartementsPageDoc, page: PAGES.static.recuperationDepartements, imageUrl: locationFrance.src },
  { summary: recuperationMissionLocalePageSummaryDoc, doc: recuperationMissionLocalesPageDoc, page: PAGES.static.recuperationMissionLocales, imageUrl: house.src },
]

export default async function ExplorerApiPage({ params }: PropsWithLangParams) {
  const { lang } = await params
  const { t } = await getServerTranslation(lang, "explorer")

  return (
    <Container maxWidth="xl" style={{ marginTop: fr.spacing("2w"), marginBottom: fr.spacing("9w") }}>
      <Box>
        <Breadcrumb
          currentPageLabel={PAGES.static.explorerApi.getTitle(lang, t)}
          homeLinkProps={{
            href: "/",
          }}
          segments={[]}
        />
      </Box>
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center">
        <Box position="relative" display="flex" alignItems="center" flexDirection="column" justifyContent="center" gap={fr.spacing("3w")}>
          <Typography variant="h1" align="center" sx={{ color: fr.colors.decisions.text.label.blueEcume.default }}>
            {PAGES.static.explorerApi.getTitle(lang, t)}
          </Typography>
          <Box
            component="h4"
            sx={{
              color: fr.colors.decisions.artwork.minor.blueEcume.default,
              fontWeight: "normal",
              textWrap: "balance",
              textAlign: "center",
            }}
            dangerouslySetInnerHTML={{ __html: t("summary", { lng: lang }) }}
          ></Box>
        </Box>
      </Box>
      <Box my={fr.spacing("5w")} display="grid" gridTemplateColumns={["1fr", "1fr 1fr", "1fr 1fr 1fr"]} gap={fr.spacing("2w")}>
        {tiles.map(({ summary, doc, page, imageUrl, style }) => (
          <Tile
            key={page.getPath(lang)}
            title={getTextOpenAPI(summary.title, lang)}
            desc={getTextOpenAPI(summary.headline, lang)}
            imageSvg
            imageUrl={imageUrl}
            enlargeLinkOrButton
            linkProps={{ href: page.getPath(lang) }}
            style={style}
            start={
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: fr.spacing("1w") }}>
                <TagDsfr>{t(`type.${doc.type}`, { lng: lang })}</TagDsfr>
                {doc.habilitation !== null && (
                  <Badge as="span" severity="info" noIcon small>
                    {t("habilitationRequise.badge", { lng: lang })}
                  </Badge>
                )}
              </Box>
            }
          />
        ))}
      </Box>
      <Box sx={{ background: fr.colors.decisions.background.alt.beigeGrisGalet.default }}>
        <Container maxWidth="xl" disableGutters>
          <Box display="grid" gridTemplateColumns={["1fr", "1fr", "1fr 1fr 1fr"]} padding={{ md: fr.spacing("6w") }}>
            <Box display="flex" alignItems="center" justifyContent="center" position="relative">
              <Box sx={{ display: { xs: "none", md: "block" } }}>
                <Artwork name="not-found-solid-iii-0" />
              </Box>
            </Box>
            <Box display="grid" gap={fr.spacing("3w")} padding={fr.spacing("3w")} gridColumn={["span 1", "span 1", "span 2"]}>
              <Typography variant="h3" sx={{ color: fr.colors.decisions.text.label.blueEcume.default }}>
                Il vous manque des données, outils, etc. pour répondre à vos besoins ?
              </Typography>
              <Box display="grid" gap={fr.spacing("2v")}>
                <Typography>
                  <DsfrLink href={`mailto:${CONTACT_EMAIL}`}>Dites-le nous</DsfrLink>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Container>
  )
}
