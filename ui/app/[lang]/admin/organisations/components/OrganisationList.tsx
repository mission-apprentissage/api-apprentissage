"use client"

import { fr } from "@codegouvfr/react-dsfr"
import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { Box, Checkbox, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, Typography } from "@mui/material"
import { useQuery } from "@tanstack/react-query"
import type { IOrganisationHabilitation } from "api-alternance-sdk"
import { ORGANISATION_HABILITATIONS } from "api-alternance-sdk"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { useDeleteOrganisation } from "@/app/[lang]/admin/hooks/useDeleteOrganisation"
import type { WithLang } from "@/app/i18n/settings"
import SearchBar from "@/components/SearchBar"
import { Table } from "@/components/table/Table"
import { apiGet } from "@/utils/api.utils"
import { PAGES } from "@/utils/routes.utils"
import { CreateOrganisation } from "./CreateOrganisation"

const HABILITATIONS_PARAM = "habilitations"

function isHabilitation(value: string): value is IOrganisationHabilitation {
  return (ORGANISATION_HABILITATIONS as readonly string[]).includes(value)
}

export default function OrganisationList({ lang }: WithLang) {
  const searchParams = useSearchParams()
  const { push } = useRouter()
  const deleteOrganisation = useDeleteOrganisation()
  const [selectedOrganisation, setSelectedOrganisation] = useState<{ id: string; name: string } | null>(null)

  const modal = useMemo(
    () =>
      createModal({
        id: "confirm-delete-organisation-modal",
        isOpenedByDefault: false,
      }),
    []
  )

  const searchValue = searchParams?.get("q") ?? ""
  const selectedHabilitations = useMemo(() => (searchParams?.getAll(HABILITATIONS_PARAM) ?? []).filter(isHabilitation), [searchParams])

  const result = useQuery({
    queryKey: ["/_private/admin/organisations", { searchValue, habilitations: selectedHabilitations }],
    queryFn: async () =>
      apiGet("/_private/admin/organisations", {
        querystring: { q: searchValue, habilitations: selectedHabilitations },
      }),
  })

  if (result.isError) {
    throw result.error
  }

  const pushFilters = useCallback(
    (filters: { q?: string; habilitations?: IOrganisationHabilitation[] }) => {
      const nextSearchParams = new URLSearchParams(searchParams?.toString())

      if (filters.q !== undefined) {
        nextSearchParams.set("q", filters.q)
      }

      if (filters.habilitations !== undefined) {
        nextSearchParams.delete(HABILITATIONS_PARAM)
        filters.habilitations.forEach((habilitation) => nextSearchParams.append(HABILITATIONS_PARAM, habilitation))
      }

      push(`${PAGES.static.adminOrganisations.getPath(lang)}?${nextSearchParams.toString()}`)
    },
    [lang, push, searchParams]
  )

  const handleDeleteClick = (id: string, name: string) => {
    deleteOrganisation.reset()
    setSelectedOrganisation({ id, name })
    modal.open()
  }

  const handleConfirmDelete = useCallback(() => {
    if (selectedOrganisation) {
      deleteOrganisation.mutate(
        { id: selectedOrganisation.id },
        {
          onSuccess: () => {
            modal.close()
          },
        }
      )
    }
  }, [deleteOrganisation, selectedOrganisation, modal])

  const deleteError = deleteOrganisation.isError ? "Une erreur est survenue lors de la suppression." : null

  return (
    <>
      <CreateOrganisation lang={lang} />

      <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", gap: fr.spacing("2w"), marginTop: fr.spacing("2w") }}>
        <Box sx={{ flex: "1 1 320px" }}>
          <SearchBar
            onButtonClick={(q) => pushFilters({ q })}
            onClear={() => {
              if (searchValue !== "") {
                pushFilters({ q: "" })
              }
            }}
            defaultValue={searchValue}
            allowEmptySearch
          />
        </Box>

        <FormControl sx={{ flex: "0 1 320px", minWidth: 240 }} size="small">
          {/* `shrink` + `notched` sont nécessaires avec `displayEmpty`, sinon le label se superpose au placeholder */}
          <InputLabel id="organisations-habilitations-filter-label" shrink>
            Habilitations
          </InputLabel>
          <Select
            labelId="organisations-habilitations-filter-label"
            id="organisations-habilitations-filter"
            multiple
            displayEmpty
            value={selectedHabilitations}
            onChange={({ target: { value } }) => pushFilters({ habilitations: (typeof value === "string" ? value.split(",") : value).filter(isHabilitation) })}
            input={<OutlinedInput notched label="Habilitations" />}
            renderValue={(selected) =>
              selected.length === 0 ? (
                <Box component="span" sx={{ color: "text.secondary" }}>
                  Toutes les habilitations
                </Box>
              ) : (
                selected.join(", ")
              )
            }
          >
            {ORGANISATION_HABILITATIONS.map((habilitation) => (
              <MenuItem key={habilitation} value={habilitation}>
                <Checkbox checked={selectedHabilitations.includes(habilitation)} />
                <ListItemText primary={habilitation} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Table
        rows={result.data ?? []}
        loading={result.isLoading}
        columns={[
          {
            field: "nom",
            headerName: "Nom",
            flex: 1,
          },
          {
            field: "habilitations",
            headerName: "Habilitations",
            flex: 1,
            valueGetter: (value: IOrganisationHabilitation[]) => value.join(", "),
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            getActions: ({ row: { _id, nom } }) => [
              <Button
                key="view"
                iconId="fr-icon-arrow-right-line"
                linkProps={{
                  href: PAGES.dynamic.adminOrganisationView(_id).getPath(lang),
                }}
                priority="tertiary no outline"
                title="Voir l'organisation"
              />,
              <Button
                key="delete"
                iconId="fr-icon-close-line"
                priority="tertiary no outline"
                title="Supprimer l'organisation"
                nativeButtonProps={modal.buttonProps}
                onClick={() => handleDeleteClick(_id, nom)}
              />,
            ],
          },
        ]}
      />

      <modal.Component
        title={`Supprimer l'organisation "${selectedOrganisation?.name}" ?`}
        buttons={[
          {
            children: "Annuler",
            disabled: deleteOrganisation.isPending,
          },
          {
            onClick: handleConfirmDelete,
            children: "Confirmer la suppression",
            disabled: deleteOrganisation.isPending,
            doClosesModal: false,
          },
        ]}
      >
        <Typography>
          Êtes-vous sûr de vouloir supprimer cette organisation ? Cette action est irréversible et tous les utilisateurs rattachés à cette organisation se retrouveront sans
          organisation.
        </Typography>
        {deleteError && (
          <Box sx={{ marginTop: fr.spacing("2w") }}>
            <Alert description={deleteError} severity="error" small />
          </Box>
        )}
      </modal.Component>
    </>
  )
}
