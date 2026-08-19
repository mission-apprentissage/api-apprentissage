"use client"

import { Button } from "@codegouvfr/react-dsfr/Button"
import { Input } from "@codegouvfr/react-dsfr/Input"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box } from "@mui/material"
import { captureException } from "@sentry/nextjs"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import NextLink from "next/link"
import { useForm } from "react-hook-form"
import { zRoutes } from "shared"
import type { IOrganisationCreate } from "shared/models/organisation.model"

import type { WithLang } from "@/app/i18n/settings"
import { ApiError, apiPost } from "@/utils/api.utils"
import { PAGES } from "@/utils/routes.utils"

const modal = createModal({
  id: "admin-create-organisation",
  isOpenedByDefault: false,
})

type IExistingOrganisation = { id: string; nom: string }

/**
 * L'API répond 409 avec l'organisation existante lorsque le nom est déjà pris.
 */
function getExistingOrganisation(error: unknown): IExistingOrganisation | null {
  if (!(error instanceof ApiError) || error.context.statusCode !== 409) {
    return null
  }

  const data = error.context.errorData

  if (typeof data !== "object" || data === null || !("id" in data) || !("nom" in data)) {
    return null
  }

  if (typeof data.id !== "string" || typeof data.nom !== "string") {
    return null
  }

  return { id: data.id, nom: data.nom }
}

export function CreateOrganisation({ lang }: WithLang) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (body: IOrganisationCreate) => {
      await apiPost("/_private/admin/organisations", { body })
    },
    onError: (error) => {
      if (getExistingOrganisation(error) !== null) {
        return
      }

      console.error(error)
      captureException(error)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/_private/admin/organisations"] })
      modal.close()
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<IOrganisationCreate>({
    resolver: zodResolver(zRoutes.post["/_private/admin/organisations"].body),
  })

  const existingOrganisation = getExistingOrganisation(mutation.error)

  if (mutation.isError && existingOrganisation === null) {
    throw mutation.error
  }

  // `.fr-message` est en `display: flex` : sans ce span englobant, chaque noeud devient un item
  // flex distinct et les espaces (comme les <br />) entre eux sont supprimés.
  const errorMessage = existingOrganisation ? (
    <span>
      Une organisation portant ce nom existe déjà.{" "}
      <NextLink href={PAGES.dynamic.adminOrganisationView(existingOrganisation.id).getPath(lang)}>Accéder à l'organisation « {existingOrganisation.nom} »</NextLink>
    </span>
  ) : (
    errors?.nom?.message
  )

  const { onChange: onNomChange, ...nomInputProps } = register("nom", { required: false })

  return (
    <>
      <Button
        nativeButtonProps={modal.buttonProps}
        onClick={() => {
          // Repartir d'un formulaire vierge à chaque ouverture
          mutation.reset()
          reset()
        }}
      >
        Créer une organisation
      </Button>

      <modal.Component
        title="Créer une organisation"
        buttons={[
          {
            children: "Annuler",
            disabled: isSubmitting,
          },
          {
            type: "submit",
            onClick: handleSubmit(async (d) => mutation.mutateAsync(d)),
            children: "Créer",
            disabled: isSubmitting,
            doClosesModal: false,
          },
        ]}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(async (d) => mutation.mutateAsync(d))}
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Input
            label="Nom de l'organisation"
            hintText="Le nom de l'organisation ne pourra pas être modifié par la suite"
            state={errorMessage ? "error" : "default"}
            stateRelatedMessage={errorMessage}
            nativeInputProps={{
              ...nomInputProps,
              onChange: async (event) => {
                // La saisie invalide le conflit remonté par l'API
                if (mutation.isError) {
                  mutation.reset()
                }
                await onNomChange(event)
              },
            }}
          />
        </Box>
      </modal.Component>
    </>
  )
}
