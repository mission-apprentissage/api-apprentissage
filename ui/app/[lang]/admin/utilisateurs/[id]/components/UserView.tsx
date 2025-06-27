"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Snackbar, Typography } from "@mui/material";
import { captureException } from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { FieldError } from "react-hook-form";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { zRoutes } from "shared";
import type { IOrganisationInternal } from "shared/models/organisation.model";
import type { IUserAdminUpdate, IUserAdminView } from "shared/models/user.model";
import type { Jsonify } from "type-fest";

import type { WithLang } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { apiPut } from "@/utils/api.utils";
import { formatDate, formatNullableDate } from "@/utils/date.utils";
import { PAGES } from "@/utils/routes.utils";

type Props = WithLang<{
  user: Jsonify<IUserAdminView>;
  organisations: Jsonify<IOrganisationInternal[]>;
}>;

function getInputState(error: FieldError | undefined | null): {
  state: "default" | "error" | "success";
  stateRelatedMessage: string;
} {
  if (!error) {
    return { state: "default", stateRelatedMessage: "" };
  }

  return { state: "error", stateRelatedMessage: error.message ?? "Erreur de validation" };
}

export default function UserView({ user, organisations, lang }: Props) {
  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    getValues,
    setValue,
    trigger,
  } = useForm<IUserAdminUpdate>({
    mode: "all",
    resolver: zodResolver(zRoutes.put["/_private/admin/users/:id"].body),
    defaultValues: {
      email: user.email,
      is_admin: user.is_admin,
      organisation: user.organisation ?? "",
      type: user.type,
    },
  });

  const { t } = useTranslation("global", { lng: lang });
  const isAdminControl = control.register("is_admin");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: IUserAdminUpdate) => {
      await apiPut("/_private/admin/users/:id", {
        params: { id: user._id },
        body: {
          ...data,
          organisation: data.organisation === "" ? null : data.organisation,
        },
      });
    },
    onError: (error) => {
      captureException(error);
      console.error(error);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["/_private/admin/users"] });
    },
  });

  if (mutation.isError) {
    captureException(mutation.error);
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
        <Input label="Email" nativeInputProps={control.register("email")} {...getInputState(errors?.email)} />

        <Select
          label={<Typography>Organisation</Typography>}
          nativeSelectProps={control.register("organisation")}
          {...getInputState(errors?.organisation)}
        >
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
            setValue("is_admin", v, { shouldTouch: true });
            await trigger("is_admin");
          }}
        />
        <Input label="Type" nativeInputProps={control.register("type")} {...getInputState(errors?.type)} />
        <Input
          label="Activite"
          textArea
          nativeTextAreaProps={{ value: user.activite ?? "", name: "activite" }}
          disabled
        />
        <Input label="Objectif" nativeInputProps={{ value: user.objectif ?? "", name: "objectif" }} disabled />
        <Input
          label="Cas Usage"
          textArea
          nativeTextAreaProps={{ value: user.cas_usage ?? "", name: "cas_usage" }}
          disabled
        />
        <Input
          label="CGU Accépté le"
          nativeInputProps={{ value: formatNullableDate(user.cgu_accepted_at), name: "cgu_accepted_at" }}
          disabled
        />
        <Input
          label="Mise à jour le"
          nativeInputProps={{ value: formatDate(user.updated_at), name: "updated_at" }}
          disabled
        />
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
        data={user.api_keys.map((k) => [
          k.name,
          formatNullableDate(k.last_used_at, "PPP à p"),
          formatDate(k.created_at, "PPP à p"),
          formatDate(k.expires_at, "PPP à p"),
        ])}
      ></Table>
    </>
  );
}
