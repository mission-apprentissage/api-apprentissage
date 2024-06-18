import { fr } from "@codegouvfr/react-dsfr";
import { Box, Typography } from "@mui/material";

export function SimulateurNpecHeadline() {
  return (
    <Box
      sx={{
        marginBottom: fr.spacing("6w"),
      }}
    >
      <Typography
        variant="h1"
        sx={{
          color: fr.colors.decisions.text.label.blueEcume.default,
          textAlign: "center",
          marginBottom: fr.spacing("4w"),
        }}
      >
        Simulateur
      </Typography>

      <Typography
        sx={{
          marginTop: fr.spacing("1w"),
          textWrap: "balance",
          color: fr.colors.decisions.artwork.minor.blueEcume.default,
          textAlign: "center",
        }}
        variant="h4"
      >
        Calculer le Niveau de Prise En Charge (NPEC) d’un contrat d’apprentissage en fonction de l’OPCO
      </Typography>
    </Box>
  );
}
