"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Box, Typography } from "@mui/material";
import Autocomplete, { AutocompleteRenderInputParams, AutocompleteRenderOptionState } from "@mui/material/Autocomplete";
import Popper, { PopperProps } from "@mui/material/Popper";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import { matchSorter } from "match-sorter";

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

function renderOption(
  props: React.HTMLAttributes<HTMLLIElement>,
  option: { intitule: string; code: string },
  { inputValue }: AutocompleteRenderOptionState
) {
  const key = getOptionKey(option);
  const label = getOptionLabel(option);
  const matches = match(label, inputValue, { insideWords: true, findAllOccurrences: true });
  const parts = parse(label, matches);

  return (
    <li key={key} {...props}>
      <div>
        {parts.map((part, index) => (
          <span
            key={index}
            style={{
              fontWeight: part.highlight ? 700 : 400,
            }}
          >
            {part.text}
          </span>
        ))}
      </div>
    </li>
  );
}

function PopperComponent(props: PopperProps) {
  return <Popper placement="bottom" modifiers={[{ name: "flip", enabled: false }]} {...props} />;
}

function filterOptions(options: { intitule: string; code: string }[], { inputValue }: { inputValue: string }) {
  const allResults = matchSorter(options, inputValue, { keys: ["code", "intitule"] });
  return allResults.slice(0, 200);
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
        filterOptions={filterOptions}
        noOptionsText="Nous ne trouvons pas de résultats pour la certification renseignée"
        size="small"
        renderOption={renderOption}
      />
    </Box>
  );
}
