"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Dialog, DialogContent, Typography } from "@mui/material";
import { captureException } from "@sentry/nextjs";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldError, SubmitHandler, useForm } from "react-hook-form";
import { IBody, IPostRoutes, zRoutes } from "shared";
import { Jsonify } from "type-fest";

import { Artwork } from "@/components/artwork/Artwork";
import { useJwtToken } from "@/hooks/useJwtToken";
import { ApiError, apiPost } from "@/utils/api.utils";
import { PAGES } from "@/utils/routes.utils";

type Inputs = Jsonify<IBody<IPostRoutes["/_private/auth/register-feedback"]>>;

function getInputState(error: FieldError | undefined | null): {
  state: "default" | "error" | "success";
  stateRelatedMessage: string;
} {
  if (!error) {
    return { state: "default", stateRelatedMessage: "" };
  }

  return { state: "error", stateRelatedMessage: error.message ?? "Erreur de validation" };
}

const defaultErrorMessage = "Une erreur est survenue lors de l'envoi du formulaire. Veuillez réessayer ultérieurement.";

export default function RegisterFeedbackPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    resolver: zodResolver(zRoutes.post["/_private/auth/register-feedback"].body),
  });

  const token = useJwtToken();
  const { push } = useRouter();

  const [submitError, setSubmitError] = useState<string | null>(!token.valid ? token.error : null);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      if (!token.valid) {
        setSubmitError(token.error);
        return;
      }

      setSubmitError(null);
      await apiPost("/_private/auth/register-feedback", {
        headers: {
          authorization: `Bearer ${token.value}`,
        },
        body: data,
      });
      push(PAGES.static.home.path);
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

  const onCreateAccountClicked = () => {
    if (token.valid) {
      push(PAGES.dynamic.inscription(token.value).path);
    } else {
      push(PAGES.static.compteProfil.path);
    }
  };

  return (
    <Dialog
      open
      aria-labelledby="register-feedback-modal-title"
      aria-describedby="register-feedback-modal-description"
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
          padding: fr.spacing("5w"),
        }}
      >
        <Box sx={{ textAlign: "right", marginBottom: fr.spacing("2w") }}>
          <Button priority="tertiary">
            <Box component={NextLink} href={PAGES.static.home.path} sx={{ backgroundImage: "none" }}>
              Retourner sur le site API Apprentissage
            </Box>
          </Button>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: fr.spacing("5w"),
            gap: fr.spacing("5w"),
            marginBottom: fr.spacing("3w"),
            border: "1px solid var(--light-border-default-grey, #DDD)",
            background: "var(--light-background-default-grey, #FFF)",
          }}
        >
          <Box>
            <Artwork name="thinking-woman-2" />
          </Box>
          <Box>
            <Typography
              variant="h1"
              align="center"
              id="register-feedback-modal-title"
              sx={{
                marginBottom: fr.spacing("1w"),
                color: fr.colors.decisions.text.label.blueEcume.default,
              }}
            >
              Aider nous à améliorer nos services
            </Typography>
            <Typography align="center" id="register-feedback-modal-description">
              Vous avez souhaité <strong>ne pas créer de compte</strong> pour vous connecter au service API
              Apprentissage. <strong>Dites-nous en plus !</strong>
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
            <Input
              label="Votre commentaire"
              {...getInputState(errors?.comment)}
              nativeTextAreaProps={register("comment", { required: false })}
              textArea
            />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Button
                size="large"
                type="submit"
                disabled={isSubmitting || !token.valid}
                priority="primary"
                iconId="fr-icon-arrow-right-line"
                iconPosition="right"
              >
                Envoyer
              </Button>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: fr.spacing("5w") }}>
              <Button
                size="large"
                priority="tertiary"
                disabled={isSubmitting || !token.valid}
                onClick={onCreateAccountClicked}
              >
                Il s’agit d’une erreur, je souhaite créer mon compte
              </Button>
            </Box>
          </Box>
          {submitError && (
            <Box sx={{ marginTop: fr.spacing("2w") }}>
              <Alert description={submitError} severity="error" small />
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
