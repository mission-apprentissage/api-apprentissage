"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Box, Typography } from "@mui/material";
import { useMemo } from "react";

import { AutocompleteSelect } from "@/components/select/AutocompleteSelect";

import { Pastille } from "./Pastille";

type Item = { titre: string; idcc: number };

type EntrepriseSectionProps = {
  conventions_collectives: Item[];
  onIdccChanged: (idcc: number | null) => unknown;
};

function getOptionLabel(option: Item) {
  return `${option.idcc} - ${option.titre}`;
}

export function EntrepriseSection(props: EntrepriseSectionProps) {
  const options = useMemo(
    () =>
      props.conventions_collectives.map((convention) => ({
        key: convention.idcc,
        label: getOptionLabel(convention),
      })),
    [props.conventions_collectives]
  );

  return (
    <Box sx={{ display: "flex", gap: fr.spacing("2w"), flexDirection: "column" }}>
      <Pastille>2</Pastille>
      <Typography
        className={fr.cx("fr-text--lead", "fr-text--bold")}
        sx={{ color: fr.colors.decisions.artwork.minor.blueEcume.default }}
      >
        Entreprise qui embauche l’apprenti
      </Typography>
      <AutocompleteSelect
        id="idcc-quick-search"
        options={options}
        onChange={(option) => props.onIdccChanged(option?.key ?? null)}
        noOptionsText="Nous ne trouvons pas de résultats pour la convention collective renseignée"
      />
    </Box>
  );
}
