import { Input } from "@codegouvfr/react-dsfr/Input";
import Autocomplete, { AutocompleteRenderInputParams, AutocompleteRenderOptionState } from "@mui/material/Autocomplete";
import Popper, { PopperProps } from "@mui/material/Popper";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import { matchSorter } from "match-sorter";

interface AutocompleteSelectOption<T extends string | number> {
  key: T;
  label: string;
}

interface AutocompleteSelectProps<T extends string | number> {
  options: AutocompleteSelectOption<T>[];
  onChange: (value: AutocompleteSelectOption<T> | null) => void;
  noOptionsText: string;
  id: string;
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

function renderOption<T extends string | number>(
  props: React.HTMLAttributes<HTMLLIElement>,
  option: AutocompleteSelectOption<T>,
  { inputValue }: AutocompleteRenderOptionState
) {
  const { key, label } = option;
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

function filterOptions<T extends string | number>(
  options: AutocompleteSelectOption<T>[],
  { inputValue }: { inputValue: string }
) {
  const allResults = matchSorter(options, inputValue, { keys: ["label"] });
  return allResults.slice(0, 50);
}

function getOptionKey<T extends string | number>(option: AutocompleteSelectOption<T>) {
  return option.key;
}

function getOptionLabel<T extends string | number>(option: AutocompleteSelectOption<T>) {
  return option.label;
}

export function AutocompleteSelect<T extends string | number>(props: AutocompleteSelectProps<T>) {
  return (
    <Autocomplete
      id={props.id}
      disablePortal
      openOnFocus
      options={props.options}
      getOptionLabel={getOptionLabel}
      getOptionKey={getOptionKey}
      renderInput={InputOption}
      PopperComponent={PopperComponent}
      onChange={(_event, value) => {
        props.onChange(value);
      }}
      filterOptions={filterOptions}
      noOptionsText={props.noOptionsText}
      size="small"
      renderOption={renderOption}
    />
  );
}