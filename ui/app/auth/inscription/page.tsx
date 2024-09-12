"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { RadioButtons } from "@codegouvfr/react-dsfr/RadioButtons";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Box, Dialog, DialogContent, Typography } from "@mui/material";
import { captureException } from "@sentry/nextjs";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { FieldError, SubmitHandler } from "react-hook-form";
import { useController, useForm } from "react-hook-form";
import type { IBody, IPostRoutes } from "shared";
import { zRoutes } from "shared";
import type { Jsonify } from "type-fest";

import { Artwork } from "@/components/artwork/Artwork";
import { useAuth } from "@/context/AuthContext";
import { useJwtToken } from "@/hooks/useJwtToken";
import { ApiError, apiPost } from "@/utils/api.utils";
import { PAGES } from "@/utils/routes.utils";

type Inputs = Jsonify<IBody<IPostRoutes["/_private/auth/register"]>>;

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

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Inputs>({
    mode: "all",
    resolver: zodResolver(zRoutes.post["/_private/auth/register"].body),
    defaultValues: {
      objectif: null,
    },
  });
  const { user, setUser } = useAuth();

  const token = useJwtToken();
  const { push } = useRouter();

  const typeController = useController({
    name: "type",
    control,
    rules: { required: true },
  });
  const objectifController = useController({
    name: "objectif",
    control,
    rules: { required: false },
  });
  const cguController = useController({
    name: "cgu",
    control,
    rules: { required: true },
  });
  const [submitError, setSubmitError] = useState<string | null>(!token.valid ? token.error : null);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      if (!token.valid) {
        setSubmitError(token.error);
        return;
      }

      setSubmitError(null);
      const user = await apiPost("/_private/auth/register", {
        headers: {
          authorization: `Bearer ${token.value}`,
        },
        body: data,
      });
      setUser(user);
      push(PAGES.static.compteProfil.path);
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

  useEffect(() => {
    if (user) {
      push(PAGES.static.compteProfil.path);
    }
  }, [user]);

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
              Créer mon compte
            </Typography>
            <Typography align="center" id="register-modal-description">
              Merci de renseigner les informations ci dessous pour{" "}
              <strong>finaliser la création de votre compte</strong>
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
            <Select
              label={
                <Typography>
                  Vous êtes ? &nbsp;
                  <Box component="span" sx={{ color: fr.colors.decisions.artwork.minor.redMarianne.default }}>
                    *
                  </Box>
                </Typography>
              }
              nativeSelectProps={{
                onChange: (event) => typeController.field.onChange(event.target.value),
                value: typeController.field.value,
                defaultValue: "",
              }}
              state={typeController.fieldState.error ? "error" : "default"}
              stateRelatedMessage={typeController.fieldState.error?.message ?? ""}
            >
              <option value="" disabled hidden>
                Selectionnez une option
              </option>
              <option value="operateur_public">Opérateur public</option>
              <option value="organisme_formation">Organisme de formation</option>
              <option value="entreprise">Entreprise</option>
              <option value="editeur_logiciel">Editeur de logiciel</option>
              <option value="organisme_financeur">Organisme financeur</option>
              <option value="apprenant">Apprenant</option>
              <option value="mission_apprentissage">Mission Apprentissage</option>
              <option value="autre">Autre</option>
            </Select>
            <Input
              label="Quelle est votre activité ?"
              hintText="Par exemple : développeur(euse), chef(fe) de projet, étudiant(e), etc."
              {...getInputState(errors?.activite)}
              nativeTextAreaProps={register("activite", { required: false })}
              textArea
            />
            <RadioButtons
              legend="Vous souhaitez utiliser l’API pour"
              state={objectifController.fieldState.error ? "error" : "default"}
              stateRelatedMessage={objectifController.fieldState.error?.message ?? ""}
              options={[
                {
                  label: "Fiabiliser un service existant",
                  nativeInputProps: {
                    checked: objectifController.field.value === "fiabiliser",
                    onChange: () => objectifController.field.onChange("fiabiliser"),
                  },
                },
                {
                  label: "Concevoir un nouveau service",
                  nativeInputProps: {
                    checked: objectifController.field.value === "concevoir",
                    onChange: () => objectifController.field.onChange("concevoir"),
                  },
                },
              ]}
            />
            <Input
              label="A quel(s) cas d'usage(s) voulez-vous répondre avec cette API ?"
              hintText="Par exemple : pré-remplir automatiquement des champs de formulaire, fiabiliser des données, etc."
              {...getInputState(errors?.cas_usage)}
              nativeTextAreaProps={register("cas_usage", { required: false })}
              textArea
            />
            <Checkbox
              state={cguController.fieldState.error ? "error" : "default"}
              stateRelatedMessage={"Veuillez accepter les conditions générales d'utilisation pour continuer"}
              options={[
                {
                  label: (
                    <Typography>
                      J’ai lu et j’accepte les{" "}
                      <NextLink href={PAGES.static.cgu.path} target="_blank">
                        Conditions Générales d’Utilisation
                      </NextLink>
                      &nbsp;du service&nbsp;
                      <Box component="span" sx={{ color: fr.colors.decisions.artwork.minor.redMarianne.default }}>
                        *
                      </Box>
                    </Typography>
                  ),
                  nativeInputProps: register("cgu", { required: true }),
                },
              ]}
            />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Button
                size="large"
                type="submit"
                disabled={isSubmitting || !token.valid}
                iconId="fr-icon-arrow-right-line"
                iconPosition="right"
              >
                Continuer
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
          Vous rencontrez des problèmes pour vous inscrire, contactez-nous :{" "}
          <Box
            component="a"
            href="mailto:support_api@apprentissage.beta.gouv.fr"
            sx={{ color: fr.colors.decisions.text.actionHigh.blueFrance.default }}
          >
            support_api@apprentissage.beta.gouv.fr
          </Box>
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
