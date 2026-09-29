import { Input } from "@codegouvfr/react-dsfr/Input"
import type { AutocompleteRenderInputParams, AutocompleteRenderOptionState } from "@mui/material/Autocomplete"
import Autocomplete from "@mui/material/Autocomplete"
import type { PopperProps } from "@mui/material/Popper"
import Popper from "@mui/material/Popper"
import match from "autosuggest-highlight/match"
import parse from "autosuggest-highlight/parse"
import { matchSorter } from "match-sorter"
import { useCallback } from "react"

interface AutocompleteSelectOption<T extends string | number> {
  key: T
  label: string
}

interface AutocompleteSelectProps<T extends string | number> {
  options: AutocompleteSelectOption<T>[]
  onChange: (value: AutocompleteSelectOption<T> | null) => void
  noOptionsText: string
  id: string
  label: string
  value?: AutocompleteSelectOption<T> | null
  state?: "default" | "error" | "success"
  stateRelatedMessage?: string
}

// MUI glisse une `key` dans les props de l'option : la retirer avant le spread (React refuse une key étalée).
function renderOption<T extends string | number>(
  { key: _key, ...props }: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key },
  option: AutocompleteSelectOption<T>,
  { inputValue }: AutocompleteRenderOptionState
) {
  const { key, label } = option
  const matches = match(label, inputValue, { insideWords: true, findAllOccurrences: true })
  const parts = parse(label, matches)

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
  )
}

function PopperComponent(props: PopperProps) {
  return <Popper placement="bottom" modifiers={[{ name: "flip", enabled: false }]} {...props} />
}

// Sans saisie, la liste complète reste parcourable dans l'ordre fourni ; la limite ne vaut que pour les résultats filtrés.
function filterOptions<T extends string | number>(options: AutocompleteSelectOption<T>[], { inputValue }: { inputValue: string }) {
  if (!inputValue.trim()) return options
  return matchSorter(options, inputValue, { keys: ["label"] }).slice(0, 50)
}

function isOptionEqualToValue<T extends string | number>(option: AutocompleteSelectOption<T>, value: AutocompleteSelectOption<T>) {
  return option.key === value.key
}

function getOptionKey<T extends string | number>(option: AutocompleteSelectOption<T>) {
  return option.key
}

function getOptionLabel<T extends string | number>(option: AutocompleteSelectOption<T>) {
  return option.label
}

export function AutocompleteSelect<T extends string | number>(props: AutocompleteSelectProps<T>) {
  const renderInput = useCallback(
    (params: AutocompleteRenderInputParams) => (
      <Input label={props.label} ref={params.InputProps.ref} nativeInputProps={params.inputProps} state={props.state} stateRelatedMessage={props.stateRelatedMessage} />
    ),
    [props.label, props.state, props.stateRelatedMessage]
  )

  return (
    <Autocomplete
      id={props.id}
      disablePortal
      openOnFocus
      options={props.options}
      {...(props.value === undefined ? {} : { value: props.value })}
      isOptionEqualToValue={isOptionEqualToValue}
      getOptionLabel={getOptionLabel}
      getOptionKey={getOptionKey}
      renderInput={renderInput}
      PopperComponent={PopperComponent}
      onChange={(_event, value) => {
        props.onChange(value)
      }}
      filterOptions={filterOptions}
      noOptionsText={props.noOptionsText}
      size="small"
      renderOption={renderOption}
      // La racine MUI enveloppe le fr-input-group, qui perd la marge DSFR `.fr-input-group:not(:last-child)`.
      sx={{ "&:not(:last-child)": { marginBottom: "1.5rem" } }}
    />
  )
}
