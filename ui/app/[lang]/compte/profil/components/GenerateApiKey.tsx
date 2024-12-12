"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Typography } from "@mui/material";
import { captureException } from "@sentry/nextjs";
import { useMemo, useState } from "react";
import type { SubmitHandler } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zRoutes } from "shared";

import { useApiKeysStatut } from "@/app/[lang]/compte/profil/hooks/useApiKeys";
import type { ICreateApiKeyInput } from "@/app/[lang]/compte/profil/hooks/useCreateApiKeyMutation";
import { useCreateApiKeyMutation } from "@/app/[lang]/compte/profil/hooks/useCreateApiKeyMutation";
import type { WithLangAndT } from "@/app/i18n/settings";
import { Artwork } from "@/components/artwork/Artwork";
import { ApiError } from "@/utils/api.utils";

const defaultErrorMessage = "Une erreur est survenue lors de la création du jeton. Veuillez réessayer ultérieurement.";

export const generateApiKeyModal = createModal({
  id: "generate-api-key",
  isOpenedByDefault: false,
});

export function GenerateApiKey({ lang, t }: WithLangAndT) {
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
        return t("monCompte.aucunJetonAPI", { lng: lang });
      case "actif-encrypted":
      case "actif-ready":
        return t("monCompte.besoinJetons", { lng: lang });
      case "expired":
        return t("monCompte.jetonsExpires", { lng: lang });
      default:
        return t("monCompte.genererNouveauJeton", { lng: lang });
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
        {statut === "none"
          ? t("monCompte.genererPremier", { lng: lang })
          : t("monCompte.genererNouveauJeton", { lng: lang })}
      </Button>

      <generateApiKeyModal.Component
        title={
          <span>
            <i className={fr.cx("fr-icon-arrow-right-line", "fr-text--lg")} />
            {statut === "none"
              ? t("monCompte.genererJeton", { lng: lang })
              : t("monCompte.genererNouveauJeton", { lng: lang })}
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
            label={t("monCompte.nommezJeton", { lng: lang })}
            hintText={t("monCompte.nomJetonDefault", { lng: lang })}
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
