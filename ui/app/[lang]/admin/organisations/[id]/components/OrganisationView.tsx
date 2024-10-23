"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { Box, Snackbar, Typography } from "@mui/material";
import { captureException } from "@sentry/nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { IOrganisation } from "shared/models/organisation.model";
import type { Jsonify } from "type-fest";

import type { WithLang } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { apiPut } from "@/utils/api.utils";
import { PAGES } from "@/utils/routes.utils";

type Props = WithLang<{
  organisation: Jsonify<IOrganisation>;
}>;

const HABILITATIONS = ["jobs:write", "appointments:write", "applications:write"] as const; // shared/src/security/permissions.ts#L3 ?

type FormData = {
  [key in (typeof HABILITATIONS)[number]]: boolean;
};

function buildHabilitations(data: FormData): IOrganisation["habilitations"] {
  const habilitations: IOrganisation["habilitations"] = [];

  for (const key of HABILITATIONS) {
    if (data[key]) {
      habilitations.push(key);
    }
  }

  return habilitations;
}

export function OrganisationView({ organisation, lang }: Props) {
  const { t } = useTranslation("global", { lng: lang });
  const defaultValues: FormData = useMemo(() => {
    const values: FormData = {
      "jobs:write": false,
      "appointments:write": false,
      "applications:write": false,
    };

    for (const habilitation of organisation.habilitations) {
      values[habilitation] = true;
    }
    return values;
  }, [organisation.habilitations]);

  const {
    handleSubmit,
    formState: { isSubmitting, errors },
    getValues,
    setValue,
    trigger,
    register,
  } = useForm<FormData>({
    mode: "all",
    defaultValues,
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      await apiPut("/_private/admin/organisations/:id", {
        params: { id: organisation._id },
        body: {
          habilitations: buildHabilitations(data),
        },
      });
    },
    onError: (error) => {
      captureException(error);
      console.error(error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/_private/admin/organisations"] });
    },
  });

  if (mutation.isError) {
    captureException(mutation.error);
  }

  return (
    <>
      <Breadcrumb
        pages={[PAGES.static.adminOrganisations, PAGES.dynamic.adminOrganisationView(organisation._id)]}
        lang={lang}
        t={t}
      />
      <Typography variant="h2" gutterBottom>
        Fiche organisation
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
        <Input label="Nom" nativeInputProps={{ value: organisation.nom, name: "nom" }} disabled />
        <Input label="Slug" nativeInputProps={{ value: organisation.slug, name: "slug" }} disabled />
        <Input
          label="Mise à jour le"
          nativeInputProps={{ value: organisation.updated_at, name: "updated_at" }}
          disabled
        />
        <Input label="Créé le" nativeInputProps={{ value: organisation.created_at, name: "created_at" }} disabled />

        <Typography variant="h3" gutterBottom marginTop={fr.spacing("5w")}>
          Habilitations
        </Typography>
        {HABILITATIONS.map((habilitation) => {
          const { name, ref, onChange } = register(habilitation);
          return (
            <ToggleSwitch
              key={habilitation}
              label={habilitation}
              defaultChecked={getValues(habilitation)}
              inputTitle={name}
              onChange={(checked: boolean, e: React.ChangeEvent<HTMLInputElement>) => {
                setValue(habilitation, checked);
                trigger(habilitation);
              }}
            />
          );
        })}

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Button size="large" type="submit" disabled={isSubmitting}>
            Sauvegarder
          </Button>
        </Box>
      </Box>
    </>
  );
}
