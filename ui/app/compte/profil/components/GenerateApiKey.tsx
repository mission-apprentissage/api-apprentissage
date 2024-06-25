"use client";
import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Typography } from "@mui/material";
import { captureException } from "@sentry/nextjs";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zRoutes } from "shared";

import { useApiKeysStatut } from "@/app/compte/profil/hooks/useApiKeys";
import { ICreateApiKeyInput, useCreateApiKeyMutation } from "@/app/compte/profil/hooks/useCreateApiKeyMutation";
import { Artwork } from "@/components/artwork/Artwork";
import { ApiError } from "@/utils/api.utils";

const defaultErrorMessage = "Une erreur est survenue lors de la création du jeton. Veuillez réessayer ultérieurement.";

export const generateApiKeyModal = createModal({
  id: "generate-api-key",
  isOpenedByDefault: false,
});

export function GenerateApiKey() {
  const status = useApiKeysStatut();
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

  const title = useMemo(() => {
    switch (statut) {
      case "none":
        return "Vous n’avez aucun jeton d’accès à l’API Apprentissage";
      case "actif-encrypted":
      case "actif-ready":
        return "Si vous avez besoin de jeton supplémentaires, vous pouvez en générer un nouveau";
      case "expired":
        return "Tous vos jetons d’accès à l’API Apprentissage sont expirés, vous pouvez en générer un nouveau";
      default:
        return "Générer un nouveau jeton d’accès";
    }
  }, [statut]);

  if (status === "loading") {
    return null;
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
      <Button
        nativeButtonProps={generateApiKeyModal.buttonProps}
        priority={statut === "none" || statut === "expired" ? "primary" : "secondary"}
      >
        {statut === "none" ? "Générer mon premier jeton" : "Générer un nouveau jeton d’accès"}
      </Button>

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
            label="Nommez votre jeton (optionnel)"
            hintText="Si vous ne nommez pas votre jeton, un nom lui sera attribué par défaut"
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
    </Box>
  );
}
