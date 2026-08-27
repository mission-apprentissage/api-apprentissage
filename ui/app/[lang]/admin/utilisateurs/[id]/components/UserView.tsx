"use client"

import { fr } from "@codegouvfr/react-dsfr"
import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { Button } from "@codegouvfr/react-dsfr/Button"
import { Input } from "@codegouvfr/react-dsfr/Input"
import { Select } from "@codegouvfr/react-dsfr/Select"
import { Table } from "@codegouvfr/react-dsfr/Table"
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch"
import { zodResolver } from "@hookform/resolvers/zod"
import { Box, Snackbar, Typography } from "@mui/material"
import { captureException } from "@sentry/nextjs"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { FieldError } from "react-hook-form"
import { useForm } from "react-hook-form"
import { useTranslation } from "react-i18next"
import { zRoutes } from "shared"
import type { IOrganisationInternal } from "shared/models/organisation.model"
import type { IUserAdminUpdate, IUserAdminView } from "shared/models/user.model"
import type { Jsonify } from "type-fest"

import type { WithLang } from "@/app/i18n/settings"
import Breadcrumb from "@/components/breadcrumb/Breadcrumb"
import { apiPut } from "@/utils/api.utils"
import { formatDate, formatNullableDate } from "@/utils/date.utils"
import { PAGES } from "@/utils/routes.utils"

type Props = WithLang<{
  user: Jsonify<IUserAdminView>
  organisations: Jsonify<IOrganisationInternal[]>
}>

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

export default function UserView({ user, organisations, lang }: Props) {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
    trigger,
    watch,
  } = useForm<IUserAdminUpdate>({
    mode: "all",
    resolver: zodResolver(zRoutes.put["/_private/admin/users/:id"].body),
    defaultValues: {
      email: user.email,
      prenom: user.prenom ?? "",
      nom: user.nom ?? "",
      is_admin: user.is_admin,
      organisation: user.organisation ?? "",
      type: user.type,
      other_type: user.other_type ?? "",
    },
  })

  const typeValue = watch("type")

  const { t } = useTranslation("global", { lng: lang })
  // Fiche admin non traduite (français uniquement) : messages d'erreur toujours en français,
  // indépendamment de la langue de l'URL (cf. clefs "errors.*" du namespace "global").
  const translateError = (message: string) => t(message as never, { lng: "fr" })
  const isAdminControl = control.register("is_admin")
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: async (data: IUserAdminUpdate) => {
      await apiPut("/_private/admin/users/:id", {
        params: { id: user._id },
        body: {
          ...data,
          organisation: data.organisation === "" ? null : data.organisation,
        },
      })
    },
    onError: (error) => {
      captureException(error)
      console.error(error)
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/_private/admin/users"] })
    },
  })

  if (mutation.isError) {
    captureException(mutation.error)
  }

  return (
    <>
      <Breadcrumb pages={[PAGES.static.adminUsers, PAGES.dynamic.adminUserView(user._id)]} lang={lang} t={t} />
      <Typography variant="h2" gutterBottom>
        Fiche utilisateur
      </Typography>

      {mutation.isError && (
        <Box sx={{ marginTop: fr.spacing("2w") }}>
          <Alert description={mutation.error.message} severity="error" small />
        </Box>
      )}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={mutation.isSuccess}
        onClose={() => mutation.reset()}
        autoHideDuration={5000}
        sx={{
          textWrap: "wrap",
          overflowWrap: "anywhere",
          maxWidth: fr.breakpoints.values.sm,
          backgroundColor: fr.colors.decisions.background.default.grey.default,
          top: [`160px !important`, `160px !important`, `160px !important`, `200px !important`],
        }}
      >
        <Alert description="Sauvegardé" severity="success" small />
      </Snackbar>

      {mutation.isSuccess && <Box sx={{ marginTop: fr.spacing("2w") }}></Box>}

      <Box component="form" onSubmit={handleSubmit(async (d) => mutation.mutateAsync(d))}>
        <Input label="Email" nativeInputProps={control.register("email")} {...getInputState(errors?.email, translateError)} />

        <Box
          display="grid"
          sx={{
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: fr.spacing("3w"),
          }}
        >
          <Input label="Prénom" nativeInputProps={control.register("prenom")} {...getInputState(errors?.prenom, translateError)} />
          <Input label="Nom" nativeInputProps={control.register("nom")} {...getInputState(errors?.nom, translateError)} />
        </Box>

        <Select label={<Typography>Organisation</Typography>} nativeSelectProps={control.register("organisation")} {...getInputState(errors?.organisation, translateError)}>
          <option value="">Selectionnez une option</option>
          {organisations.map((o) => (
            <option key={o.nom} value={o.nom}>
              {o.nom}
            </option>
          ))}
        </Select>

        <ToggleSwitch
          label="Administrateur"
          labelPosition="left"
          showCheckedHint={false}
          inputTitle={isAdminControl.name}
          checked={getValues("is_admin")}
          onChange={async (v) => {
            setValue("is_admin", v, { shouldTouch: true })
            await trigger("is_admin")
          }}
        />
        <Select label={<Typography>Type</Typography>} nativeSelectProps={control.register("type")} {...getInputState(errors?.type, translateError)}>
          <option value="operateur_public">Opérateur public</option>
          <option value="organisme_formation">Organisme de formation</option>
          <option value="entreprise">Entreprise</option>
          <option value="editeur_logiciel">Editeur de logiciel</option>
          <option value="apprenant">Apprenant</option>
          <option value="autre">Autre</option>
        </Select>
        {typeValue === "autre" && (
          <Input label="Veuillez préciser votre profil :" nativeInputProps={control.register("other_type")} {...getInputState(errors?.other_type, translateError)} />
        )}
        <Input
          label="Description du projet ou service (nom du projet, objectifs, url, public ciblé)"
          textArea
          nativeTextAreaProps={{ value: user.description ?? "", name: "description" }}
          disabled
        />
        <Input label="CGU Accépté le" nativeInputProps={{ value: formatNullableDate(user.cgu_accepted_at), name: "cgu_accepted_at" }} disabled />
        <Input label="Mise à jour le" nativeInputProps={{ value: formatDate(user.updated_at), name: "updated_at" }} disabled />
        <Input label="Créé le" nativeInputProps={{ value: formatDate(user.created_at), name: "created_at" }} disabled />

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Button size="large" type="submit" disabled={isSubmitting}>
            Sauvegarder
          </Button>
        </Box>
      </Box>

      <Typography variant="h3" gutterBottom marginTop={fr.spacing("5w")}>
        Clés API
      </Typography>
      <Table
        fixed
        headers={["Nom", "Dernière utilisation", "Créé le", "Expire le"]}
        data={user.api_keys.map((k) => [k.name, formatNullableDate(k.last_used_at, "PPP à p"), formatDate(k.created_at, "PPP à p"), formatDate(k.expires_at, "PPP à p")])}
      ></Table>
    </>
  )
}
