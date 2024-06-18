"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Box, Typography } from "@mui/material";
import Autocomplete, { AutocompleteRenderInputParams } from "@mui/material/Autocomplete";
import Popper, { PopperProps } from "@mui/material/Popper";

import { Pastille } from "./Pastille";

type Item = { titre: string; idcc: number };

type EntrepriseSectionProps = {
  conventions_collectives: Item[];
  onIdccChanged: (idcc: number | null) => unknown;
};

function getOptionLabel(option: Item) {
  return `${option.idcc} - ${option.titre}`;
}

function getOptionKey(option: Item) {
  return option.idcc;
}

function InputOption(params: AutocompleteRenderInputParams) {
  return (
    <Input
      label="Renseigner le code IDCC et/ou le nom de la convention collective"
      ref={params.InputProps.ref}
      nativeInputProps={params.inputProps}
    ></Input>
  );
}

function PopperComponent(props: PopperProps) {
  return <Popper placement="bottom" modifiers={[{ name: "flip", enabled: false }]} {...props} />;
}

export function EntrepriseSection(props: EntrepriseSectionProps) {
  return (
    <Box sx={{ display: "flex", gap: fr.spacing("2w"), flexDirection: "column" }}>
      <Pastille>2</Pastille>
      <Typography
        className={fr.cx("fr-text--lead", "fr-text--bold")}
        sx={{ color: fr.colors.decisions.artwork.minor.blueEcume.default }}
      >
        Entreprise qui embauche l’apprenti
      </Typography>
      <Autocomplete
        id="idcc-quick-search"
        disablePortal
        openOnFocus
        options={props.conventions_collectives}
        getOptionLabel={getOptionLabel}
        getOptionKey={getOptionKey}
        renderInput={InputOption}
        PopperComponent={PopperComponent}
        onChange={(event, value) => {
          props.onIdccChanged(value?.idcc ?? null);
        }}
        noOptionsText="Nous ne trouvons pas de résultats pour la convention collective renseignée"
        size="small"
      />
    </Box>
  );
}
