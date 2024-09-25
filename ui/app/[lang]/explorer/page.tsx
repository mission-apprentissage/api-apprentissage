import { fr } from "@codegouvfr/react-dsfr";
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import internet from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/digital/internet.svg";
import search from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/digital/search.svg";
import money from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/institutions/money.svg";
import book from "@codegouvfr/react-dsfr/dsfr/artwork/pictograms/leisure/book.svg";
import { Tag as TagDsfr } from "@codegouvfr/react-dsfr/Tag";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { Box, Container, Hidden, Typography } from "@mui/material";

import { getServerTranslation } from "@/app/i18n";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import { Artwork } from "@/components/artwork/Artwork";
import { DsfrLink } from "@/components/link/DsfrLink";
import { PAGES } from "@/utils/routes.utils";

export default async function ExplorerApiPage({ params: { lang } }: PropsWithLangParams) {
  const { t } = await getServerTranslation(lang, "explorer");

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
        <Box
          position="relative"
          display="flex"
          alignItems="center"
          flexDirection="column"
          justifyContent="center"
          gap={fr.spacing("3w")}
        >
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
      <Box
        my={fr.spacing("5w")}
        display="grid"
        gridTemplateColumns={["1fr", "1fr 1fr", "1fr 1fr 1fr"]}
        gap={fr.spacing("2w")}
      >
        <Tile
          title={PAGES.static.catalogueDesDonneesCertification.getTitle(lang, t)}
          desc={t("catalogueDesDonneesCertification.desc")}
          imageSvg
          imageUrl={book.src}
          enlargeLinkOrButton
          linkProps={{ href: PAGES.static.catalogueDesDonneesCertification.path }}
          style={{
            color: fr.colors.decisions.text.title.grey.default,
          }}
          start={<TagDsfr>{t(`type.data`, { lng: lang })}</TagDsfr>}
        />
        <Tile
          title={PAGES.static.simulateurNpec.getTitle(lang, t)}
          desc={t("simulateurNpec.desc")}
          imageSvg
          imageUrl={money.src}
          enlargeLinkOrButton
          linkProps={{ href: PAGES.static.simulateurNpec.path }}
          start={<TagDsfr>{t(`type.outil`, { lng: lang })}</TagDsfr>}
        />
        <Tile
          title="Recherche d’opportunités d’emploi en alternance"
          desc={t("rechercheOffre.desc")}
          imageSvg
          imageUrl={search.src}
          enlargeLinkOrButton
          start={<TagDsfr>{t(`type.data`, { lng: lang })}</TagDsfr>}
          linkProps={{ href: PAGES.static.rechercheOffre.path }}
        />
        <Tile
          title={PAGES.static.depotOffre.getTitle(lang, t)}
          desc={t("depotOffre.desc")}
          imageSvg
          imageUrl={internet.src}
          enlargeLinkOrButton
          linkProps={{ href: PAGES.static.depotOffre.path }}
          start={<TagDsfr>{t(`type.outil`, { lng: lang })}</TagDsfr>}
        />
      </Box>
      <Box sx={{ background: fr.colors.decisions.background.alt.beigeGrisGalet.default }}>
        <Container maxWidth="xl" disableGutters>
          <Box display="grid" gridTemplateColumns={["1fr", "1fr", "1fr 1fr 1fr"]} padding={{ md: fr.spacing("6w") }}>
            <Box display="flex" alignItems="center" justifyContent="center" position="relative">
              <Hidden mdDown>
                <Artwork name="not-found-solid-iii-0" />
              </Hidden>
            </Box>
            <Box
              display="grid"
              gap={fr.spacing("3w")}
              padding={fr.spacing("3w")}
              gridColumn={["span 1", "span 1", "span 2"]}
            >
              <Typography variant="h3" sx={{ color: fr.colors.decisions.text.label.blueEcume.default }}>
                Il vous manque des données, outils, etc. pour répondre à vos besoins ?
              </Typography>
              <Box display="grid" gap={fr.spacing("2v")}>
                <Typography>
                  <DsfrLink href="mailto:support_api@apprentissage.beta.gouv.fr">Dites-le nous</DsfrLink>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Container>
  );
}
