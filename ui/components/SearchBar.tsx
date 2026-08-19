import type { SearchBarProps } from "@codegouvfr/react-dsfr/SearchBar"
import { SearchBar as DSFRSearchBar } from "@codegouvfr/react-dsfr/SearchBar"
import type { FC } from "react"

interface Props extends SearchBarProps {
  defaultValue?: string
  /** Appelé dès que le champ devient vide (croix native, effacement au clavier), sans attendre le clic sur le bouton */
  onClear?: () => void
}

const SearchBar: FC<Props> = ({ defaultValue, onClear, ...rest }) => {
  return (
    <DSFRSearchBar
      renderInput={(props) => (
        <input
          {...props}
          defaultValue={defaultValue}
          onChange={(event) => {
            if (event.target.value === "") {
              onClear?.()
            }
          }}
        />
      )}
      {...rest}
    />
  )
}

export default SearchBar
