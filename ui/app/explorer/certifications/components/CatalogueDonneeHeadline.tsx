import { fr } from "@codegouvfr/react-dsfr";
import { Box, Typography } from "@mui/material";

import { Artwork } from "@/components/artwork/Artwork";
import { DsfrLink } from "@/components/link/DsfrLink";
import { Tag } from "@/components/tag/Tag";
import { PAGES } from "@/utils/routes.utils";

const threeColumns = {
  md: "1fr",
  lg: "1fr 1fr 1fr",
  gap: fr.spacing("9w"),
};

const spanTwoColumns = {
  md: "span 1",
  lg: "span 2",
};

export function CatalogueHeadline() {
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
            <strong>Fréquence de mise à jour :</strong> <Tag color="blueEcume">TOUS LES JOURS</Tag>
          </Typography>
          {/* <Typography component="span" variant="body1">
              <strong>Dernière mise à jour :</strong>{" "}
               <Tag color="blueEcume">
                le Date du jour
              </Tag>
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
          <Artwork name="designer" />
          <Typography sx={{ textWrap: "balance" }}>
            <strong>Besoin de ces données pour votre projet ?</strong>
          </Typography>
          <Typography>
            <DsfrLink href={PAGES.static.documentationTechnique.path}>Consulter le swagger</DsfrLink>
          </Typography>
          <Typography>
            <DsfrLink href={PAGES.static.compteProfil.path}>Obtenir un jeton d’accès</DsfrLink>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
