"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Box, Typography } from "@mui/material";
import { useMemo } from "react";

import { AutocompleteSelect } from "@/components/select/AutocompleteSelect";

import { Pastille } from "./Pastille";

type CertificationSectionProps = {
  rncps: { intitule: string; code: string }[];
  onRncpChanged: (rncp: string | null) => unknown;
};

function getOptionLabel(option: { intitule: string; code: string }) {
  return `${option.code} - ${option.intitule}`;
}

export function CertificationSection(props: CertificationSectionProps) {
  const options = useMemo(
    () =>
      props.rncps.map((rncp) => ({
        key: rncp.code,
        label: getOptionLabel(rncp),
      })),
    [props.rncps]
  );

  return (
    <Box sx={{ display: "flex", gap: fr.spacing("2w"), flexDirection: "column" }}>
      <Pastille>1</Pastille>
      <Typography
        className={fr.cx("fr-text--lead", "fr-text--bold")}
        sx={{
          color: fr.colors.decisions.artwork.minor.blueEcume.default,
        }}
      >
        Certification
      </Typography>
      <AutocompleteSelect
        id="rncp-quick-search"
        options={options}
        onChange={(option) => props.onRncpChanged(option?.key ?? null)}
        noOptionsText="Nous ne trouvons pas de résultats pour la certification renseignée"
      />
    </Box>
  );
}
