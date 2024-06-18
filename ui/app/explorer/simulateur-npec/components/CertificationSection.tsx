"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Box, Typography } from "@mui/material";
import Autocomplete, { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import Popper, { PopperProps } from "@mui/material/Popper";

import { Pastille } from "./Pastille";

type CertificationSectionProps = {
  rncps: { intitule: string; code: string }[];
  onRncpChanged: (rncp: string | null) => unknown;
};

function getOptionLabel(option: { intitule: string; code: string }) {
  return `${option.code} - ${option.intitule}`;
}

function getOptionKey(option: { intitule: string; code: string }) {
  return option.code;
}

function InputOption(params: AutocompleteRenderInputParams) {
  return (
    <Input
      label="Renseigner le code RNCP ou l’intitulé de la certification"
      ref={params.InputProps.ref}
      nativeInputProps={params.inputProps}
    ></Input>
  );
}

function PopperComponent(props: PopperProps) {
  return <Popper placement="bottom" modifiers={[{ name: "flip", enabled: false }]} {...props} />;
}

export function CertificationSection(props: CertificationSectionProps) {
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
      <Autocomplete
        id="rncp-quick-search"
        disablePortal
        openOnFocus
        options={props.rncps}
        getOptionLabel={getOptionLabel}
        getOptionKey={getOptionKey}
        renderInput={InputOption}
        PopperComponent={PopperComponent}
        onChange={(event, value) => {
          props.onRncpChanged(value?.code ?? null);
        }}
        noOptionsText="Nous ne trouvons pas de résultats pour la certification renseignée"
        size="small"
      />
    </Box>
  );
}
