"use client"
import { fr } from "@codegouvfr/react-dsfr"
import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Input } from "@codegouvfr/react-dsfr/Input"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Typography } from "@mui/material"
import { captureException } from "@sentry/nextjs"
import { useMemo, useState } from "react"
import type { SubmitHandler } from "react-hook-form"
import { useForm } from "react-hook-form"
import { zRoutes } from "shared"

import { useApiKeysStatut } from "@/app/[lang]/compte/profil/hooks/useApiKeys"
import type { ICreateApiKeyInput } from "@/app/[lang]/compte/profil/hooks/useCreateApiKeyMutation"
import { useCreateApiKeyMutation } from "@/app/[lang]/compte/profil/hooks/useCreateApiKeyMutation"
import type { WithLangAndT } from "@/app/i18n/settings"
import { Artwork } from "@/components/artwork/Artwork"
import { ApiError } from "@/utils/api.utils"

const defaultErrorMessage = "Une erreur est survenue lors de la création de la clé. Veuillez réessayer ultérieurement."

export const generateApiKeyModal = createModal({
  id: "generate-api-key",
  isOpenedByDefault: false,
})

// onCreated est géré par le parent (ProfilPage) plutôt que localement : ce composant se démonte
// dès que le statut repasse en "loading" (cf. early-return plus bas), ce qui emporterait un toast
// porté localement
export function GenerateApiKey({ lang, t, onCreated }: WithLangAndT<{ onCreated: () => void }>) {
  const status = useApiKeysStatut()
  const mutation = useCreateApiKeyMutation()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ICreateApiKeyInput>({
    resolver: zodResolver(zRoutes.post["/_private/user/api-key"].body),
    defaultValues: { name: "" },
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const statut = useApiKeysStatut()

  const onSubmit: SubmitHandler<ICreateApiKeyInput> = async (data) => {
    try {
      mutation.reset()
      await mutation.mutateAsync(data)
      generateApiKeyModal.close()
      // Sans argument, reset() déclenche un form.reset() natif qui décoche les radios (aucun
      // defaultChecked HTML) : cohérent avec l'absence de type de clé par défaut
      reset()
      onCreated()
    } catch (error) {
      console.error(error)
      if (error instanceof ApiError && error.context.statusCode < 500) {
        setSubmitError(error.context.message ?? defaultErrorMessage)
      } else {
        captureException(error)
        setSubmitError(defaultErrorMessage)
      }
    }
  }

  const title = useMemo(() => {
    switch (statut) {
      case "none":
        return t("monCompte.aucuneCleApi", { lng: lang })
      case "actif-encrypted":
      case "actif-ready":
        return t("monCompte.besoinCles", { lng: lang })
      case "expired":
        return t("monCompte.clesExpirees", { lng: lang })
      default:
        return t("monCompte.genererNouvelleCle", { lng: lang })
    }
  }, [statut, lang, t])

  if (status === "loading") {
    return null
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        gap: fr.spacing("2w"),
        padding: fr.spacing("4w"),
        border: `1px solid ${fr.colors.decisions.border.default.grey.default}`,
      }}
    >
      <Artwork name="outline_III" />
      <Typography textAlign="center">{title}</Typography>
      <Button nativeButtonProps={generateApiKeyModal.buttonProps} priority={statut === "none" || statut === "expired" ? "primary" : "secondary"}>
        {statut === "none" ? t("monCompte.genererPremiere", { lng: lang }) : t("monCompte.genererNouvelleCle", { lng: lang })}
      </Button>

      <generateApiKeyModal.Component
        title={
          <span>
            <i className={fr.cx("fr-icon-arrow-right-line", "fr-text--lg")} />
            {statut === "none" ? t("monCompte.genererCle", { lng: lang }) : t("monCompte.genererNouvelleCle", { lng: lang })}
          </span>
        }
        buttons={[
          {
            children: t("monCompte.annuler", { lng: lang }),
            disabled: isSubmitting,
          },
          {
            type: "submit",
            onClick: handleSubmit(onSubmit),
            children: t("monCompte.generer", { lng: lang }),
            disabled: isSubmitting,
            doClosesModal: false,
          },
        ]}
      >
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Input
            label={t("monCompte.nommezCle", { lng: lang })}
            hintText={t("monCompte.nomCleDefaut", { lng: lang })}
            state={errors?.name ? "error" : "default"}
            stateRelatedMessage={errors?.name?.message ?? "Erreur de validation"}
            nativeInputProps={register("name", { required: false })}
          />
          <RadioButtons
            legend={t("monCompte.typeCle", { lng: lang })}
            state={errors?.env ? "error" : "default"}
            stateRelatedMessage={t("monCompte.typeCleRequis", { lng: lang })}
            options={[
              {
                label: t("monCompte.typeCleProduction", { lng: lang }),
                hintText: t("monCompte.typeCleProductionHint", { lng: lang }),
                nativeInputProps: { ...register("env"), value: "production" },
              },
              {
                label: t("monCompte.typeCleSandbox", { lng: lang }),
                hintText: t("monCompte.typeCleSandboxHint", { lng: lang }),
                nativeInputProps: { ...register("env"), value: "sandbox" },
              },
            ]}
          />
          {submitError && (
            <Box sx={{ marginTop: fr.spacing("2w") }}>
              <Alert description={submitError} severity="error" small />
            </Box>
          )}
        </Box>
      </generateApiKeyModal.Component>
    </Box>
  )
}
