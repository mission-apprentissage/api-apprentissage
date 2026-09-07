"use client"
import { fr } from "@codegouvfr/react-dsfr"
import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox"
import { Input } from "@codegouvfr/react-dsfr/Input"
import { Select } from "@codegouvfr/react-dsfr/Select"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Dialog, DialogContent, Typography } from "@mui/material"
import { captureException } from "@sentry/nextjs"
import { CONTACT_EMAIL } from "api-alternance-sdk/internal"
import NextLink from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"
import type { FieldError, SubmitHandler } from "react-hook-form"
import { useController, useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import type { IBody, IPostRoutes } from "shared"
import { zRoutes } from "shared"
import type { Jsonify } from "type-fest"

import type { PropsWithLangParams } from "@/app/i18n/settings"
import { Artwork } from "@/components/artwork/Artwork"
import { useAuth } from "@/context/AuthContext"
import { useJwtToken } from "@/hooks/useJwtToken"
import { ApiError, apiPost } from "@/utils/api.utils"
import { PAGES } from "@/utils/routes.utils"

type Inputs = Jsonify<IBody<IPostRoutes["/_private/auth/register"]>>

function getInputState(
  error: FieldError | undefined | null,
  translateError: (message: string) => string
): {
  state: "default" | "error" | "success"
  stateRelatedMessage: string
} {
  if (!error) {
    return { state: "default", stateRelatedMessage: "" }
  }

  return { state: "error", stateRelatedMessage: error.message ? translateError(error.message) : "Erreur de validation" }
}

const defaultErrorMessage = "Une erreur est survenue lors de l'envoi du formulaire. Veuillez réessayer ultérieurement."

export default function RegisterPage({ params }: PropsWithLangParams) {
  const { lang } = use(params)
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    mode: "all",
    resolver: zodResolver(zRoutes.post["/_private/auth/register"].body),
  })
  const { session, setSession } = useAuth()
  const { t } = useTranslation("inscription-connexion", { lng: lang })
  // Les messages d'erreur Zod custom sont des clefs du namespace "global" (cf. shared/models/user.model.ts) ;
  // les messages génériques Zod sont déjà résolus en texte via z.config (StartIntl) et passent inchangés.
  const translateError = (message: string) => t(message as never, { lng: lang })

  const token = useJwtToken()
  const { push } = useRouter()

  const typeController = useController({
    name: "type",
    control,
    rules: { required: true },
  })
  const cguController = useController({
    name: "cgu",
    control,
    rules: { required: true },
  })
  const [submitError, setSubmitError] = useState<string | null>(!token.valid ? token.error : null)

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      if (!token.valid) {
        setSubmitError(token.error)
        return
      }

      setSubmitError(null)
      const session = await apiPost("/_private/auth/register", {
        headers: {
          authorization: `Bearer ${token.value}`,
        },
        body: data,
      })
      setSession(session)
      push(PAGES.static.compteProfil.getPath(lang))
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

  useEffect(() => {
    if (session) {
      push(PAGES.static.compteProfil.getPath(lang))
    }
  }, [session, push, lang])

  return (
    <Dialog
      open
      aria-labelledby="register-modal-title"
      aria-describedby="register-modal-description"
      fullScreen
      scroll="paper"
      PaperProps={{
        sx: {
          display: "flex",
          backgroundColor: "#ffffff",
          alignItems: "center",
          justifyContent: "center",
        },
      }}
    >
      <DialogContent
        sx={{
          maxWidth: "md",
          padding: { xs: fr.spacing("2v"), md: fr.spacing("10v") },
        }}
      >
        <Box sx={{ textAlign: "right", marginBottom: fr.spacing("2w") }}>
          <Button priority="tertiary">
            <Box component={NextLink} href={PAGES.static.home.getPath(lang)} sx={{ backgroundImage: "none" }}>
              {t("creerCompte.retournerSite", { lng: lang })}
            </Box>
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: { xs: fr.spacing("4v"), md: fr.spacing("10v") },
            gap: fr.spacing("10v"),
            marginBottom: fr.spacing("6v"),
            border: "1px solid var(--light-border-default-grey, #DDD)",
            background: "var(--light-background-default-grey, #FFF)",
          }}
        >
          <Box>
            <Artwork name="man" />
          </Box>
          <Box>
            <Typography
              variant="h1"
              align="center"
              id="register-modal-title"
              sx={{
                marginBottom: fr.spacing("1w"),
                color: fr.colors.decisions.text.label.blueEcume.default,
              }}
            >
              {t("creerCompte.creerMonCompte", { lng: lang })}
            </Typography>
            <Typography align="center" id="register-modal-description">
              {t("creerCompte.renseignerInfos", { lng: lang })} <strong>{t("creerCompte.finaliserCreation", { lng: lang })}</strong>
            </Typography>
          </Box>

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography sx={{ marginBottom: fr.spacing("2w") }}>{t("creerCompte.tousChampsObligatoires", { lng: lang })}</Typography>
            <Select
              label={<Typography>{t("creerCompte.vousEtes", { lng: lang })}</Typography>}
              nativeSelectProps={{
                onChange: (event) => typeController.field.onChange(event.target.value),
                value: typeController.field.value,
                defaultValue: "",
              }}
              state={typeController.fieldState.error ? "error" : "default"}
              stateRelatedMessage={typeController.fieldState.error?.message ? translateError(typeController.fieldState.error.message) : ""}
            >
              <option value="" disabled hidden>
                {t("creerCompte.selectionnerOption", { lng: lang })}
              </option>
              <option value="apprenant">{t("creerCompte.apprenant", { lng: lang })}</option>
              <option value="operateur_public">{t("creerCompte.operateurPublic", { lng: lang })}</option>
              <option value="organisme_formation">{t("creerCompte.organismeFormation", { lng: lang })}</option>
              <option value="entreprise">{t("creerCompte.entreprise", { lng: lang })}</option>
              <option value="editeur_logiciel">{t("creerCompte.editeurLogiciel", { lng: lang })}</option>
              <option value="autre">{t("creerCompte.autre", { lng: lang })}</option>
            </Select>
            {typeController.field.value === "autre" && (
              <Input
                label={t("creerCompte.autrePrecision", { lng: lang })}
                {...getInputState(errors?.other_type, translateError)}
                nativeInputProps={register("other_type", { required: true })}
              />
            )}
            <Box
              display="grid"
              sx={{
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: { xs: fr.spacing("3v"), md: fr.spacing("6v") },
              }}
            >
              <Box sx={{ marginBottom: fr.spacing("3v") }}>
                <Input
                  label={t("creerCompte.prenom", { lng: lang })}
                  {...getInputState(errors?.prenom, translateError)}
                  nativeInputProps={register("prenom", { required: true })}
                />
              </Box>
              <Box sx={{ marginBottom: fr.spacing("3v") }}>
                <Input label={t("creerCompte.nom", { lng: lang })} {...getInputState(errors?.nom, translateError)} nativeInputProps={register("nom", { required: true })} />
              </Box>
            </Box>
            <Input
              label={t("creerCompte.description", { lng: lang })}
              {...getInputState(errors?.description, translateError)}
              nativeTextAreaProps={register("description", { required: true })}
              textArea
            />
            <Checkbox
              state={cguController.fieldState.error ? "error" : "default"}
              stateRelatedMessage={t("creerCompte.veuillezAccepterCGV", { lng: lang })}
              options={[
                {
                  label: (
                    <Typography>
                      {t("creerCompte.jaccepte", { lng: lang })}{" "}
                      <NextLink href={PAGES.static.cgu.getPath(lang)} target="_blank">
                        {t("creerCompte.conditionsGenerales", { lng: lang })}
                      </NextLink>
                      &nbsp;{t("creerCompte.duService", { lng: lang })}
                    </Typography>
                  ),
                  nativeInputProps: register("cgu", { required: true }),
                },
              ]}
            />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Button size="large" type="submit" disabled={isSubmitting || !token.valid} iconId="fr-icon-arrow-right-line" iconPosition="right">
                {t("creerCompte.continuer", { lng: lang })}
              </Button>
            </Box>
          </Box>
          {submitError && (
            <Box sx={{ marginTop: fr.spacing("2w") }}>
              <Alert description={submitError} severity="error" small />
            </Box>
          )}
        </Box>
        <Typography textAlign="center" color={fr.colors.decisions.text.default.grey.default}>
          {t("creerCompte.problemesConnexion", { lng: lang })}{" "}
          <Box component="a" href={`mailto:${CONTACT_EMAIL}`} sx={{ color: fr.colors.decisions.text.actionHigh.blueFrance.default }}>
            {CONTACT_EMAIL}
          </Box>
        </Typography>
      </DialogContent>
    </Dialog>
  )
}
