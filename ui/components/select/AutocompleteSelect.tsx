import { Input } from "@codegouvfr/react-dsfr/Input";
import type { AutocompleteRenderInputParams, AutocompleteRenderOptionState } from "@mui/material/Autocomplete";
import Autocomplete from "@mui/material/Autocomplete";
import type { PopperProps } from "@mui/material/Popper";
import Popper from "@mui/material/Popper";
import match from "autosuggest-highlight/match";
import parse from "autosuggest-highlight/parse";
import { matchSorter } from "match-sorter";
import { useCallback } from "react";

interface AutocompleteSelectOption<T extends string | number> {
  key: T;
  label: string;
}

interface AutocompleteSelectProps<T extends string | number> {
  options: AutocompleteSelectOption<T>[];
  onChange: (value: AutocompleteSelectOption<T> | null) => void;
  noOptionsText: string;
  id: string;
  label: string;
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
  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => (
      <Input label={props.label} ref={params.InputProps.ref} nativeInputProps={params.inputProps}></Input>
    ),
    [props.label]
  );

  return (
    <Autocomplete
      id={props.id}
      disablePortal
      openOnFocus
      options={props.options}
      getOptionLabel={getOptionLabel}
      getOptionKey={getOptionKey}
      renderInput={renderInput}
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
