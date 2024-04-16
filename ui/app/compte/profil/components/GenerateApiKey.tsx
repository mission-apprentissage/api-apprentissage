"use client";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box } from "@mui/material";
import { captureException } from "@sentry/nextjs";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zRoutes } from "shared";

import { ApiError } from "@/utils/api.utils";

import { useApiKeysStatut } from "../hooks/useApiKeys";
import { ICreateApiKeyInput, useCreateApiKeyMutation } from "../hooks/useCreateApiKeyMutation";

const defaultErrorMessage = "Une erreur est survenue lors de la création du jeton. Veuillez réessayer ultérieurement.";

export const generateApiKeyModal = createModal({
  id: "generate-api-key",
  isOpenedByDefault: false,
});

export function GenerateApiKey() {
  const mutation = useCreateApiKeyMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ICreateApiKeyInput>({
    resolver: zodResolver(zRoutes.post["/_private/user/api-key"].body),
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const statut = useApiKeysStatut();

  const onSubmit: SubmitHandler<ICreateApiKeyInput> = async (data) => {
    try {
      mutation.reset();
      await mutation.mutateAsync(data);
      generateApiKeyModal.close();
      reset();
    } catch (error) {
      console.error(error);
      if (error instanceof ApiError && error.context.statusCode < 500) {
        setSubmitError(error.context.message ?? defaultErrorMessage);
      } else {
        captureException(error);
        setSubmitError(defaultErrorMessage);
      }
    }
  };

  return (
    <generateApiKeyModal.Component
      title={
        <span>
          <i className={fr.cx("fr-icon-arrow-right-line", "fr-text--lg")} />
          {statut === "none" ? "Générer un jeton d’accès" : "Générer un nouveau jeton d’accès"}
        </span>
      }
      buttons={[
        {
          children: "Annuler",
          disabled: isSubmitting,
        },
        {
          type: "submit",
          onClick: handleSubmit(onSubmit),
          children: "Générer",
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
          label="Nom du jeton"
          hintText="Vous avez la possibilité de modifier le nom du jeton"
          state={errors?.name ? "error" : "default"}
          stateRelatedMessage={errors?.name?.message ?? "Erreur de validation"}
          nativeInputProps={register("name", { required: false })}
        />
        {submitError && (
          <Box sx={{ marginTop: fr.spacing("2w") }}>
            <Alert description={submitError} severity="error" small />
          </Box>
        )}
      </Box>
    </generateApiKeyModal.Component>
  );
}
