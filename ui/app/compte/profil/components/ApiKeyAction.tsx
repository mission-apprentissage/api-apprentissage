import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Box, Snackbar, Typography } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { captureException } from "@sentry/nextjs";
import { useCallback, useMemo, useState } from "react";
import { IApiKeyPrivateJson } from "shared/models/user.model";

import { useDeleteApiKeyMutation } from "@/app/compte/profil/hooks/useDeleteApiKeyMutation";
import { ApiError } from "@/utils/api.utils";

export const confirmDeleteModal = createModal({
  id: "confirm-delete-modal",
  isOpenedByDefault: false,
});

export function ApiKeyAction({ apiKey }: { apiKey: IApiKeyPrivateJson }) {
  const deleteMutation = useDeleteApiKeyMutation();
  const [copyState, setCopyState] = useState<boolean | null>(null);

  const onClick = useCallback(() => {
    if (apiKey.value) {
      navigator.clipboard
        .writeText(apiKey.value)
        .then(() => {
          setCopyState(true);
        })
        .catch((err) => {
          console.error(err);
          captureException(err);
          setCopyState(false);
        });
    }
  }, [apiKey]);

  const onRemoveClicked = useCallback(() => {
    confirmDeleteModal.open();
  }, []);

  const onDeleteConfirm = useCallback(() => {
    deleteMutation.mutate(
      { id: apiKey._id },
      {
        onSuccess: () => {
          confirmDeleteModal.close();
        },
      }
    );
  }, [deleteMutation]);

  const deleteError = useMemo(() => {
    const { error } = deleteMutation;
    const defaultErrorMessage =
      "Une erreur est survenue lors de la suppression du jeton. Veuillez réessayer ultérieurement.";
    if (error) {
      if (error instanceof ApiError && error.context.statusCode < 500) {
        return error.context.message ?? defaultErrorMessage;
      }
      captureException(error);

      return defaultErrorMessage;
    }
  }, [deleteMutation.error]);

  return (
    <Box sx={{ display: "flex", gap: fr.spacing("1w"), flexWrap: "wrap" }}>
      <Button key="action" onClick={onClick} size="small" priority={"primary"} disabled={!apiKey.value}>
        Copier le jeton
      </Button>
      <Tooltip title="Supprimer le jeton d’accès">
        <Box
          component={"i"}
          sx={{
            color: fr.colors.decisions.background.active.blueFrance.default,
          }}
          className={fr.cx("fr-icon-question-line", "fr-icon--md")}
        ></Box>
      </Tooltip>
      <Button key="action" onClick={onRemoveClicked} size="small" priority="tertiary">
        Supprimer
      </Button>
      <confirmDeleteModal.Component
        title="Supprimer le jeton d’accès"
        buttons={[
          {
            children: "Annuler",
            disabled: deleteMutation.isPending,
          },
          {
            onClick: onDeleteConfirm,
            children: "Supprimer",
            disabled: deleteMutation.isPending,
            doClosesModal: false,
          },
        ]}
      >
        <Typography>Êtes-vous sûr de vouloir supprimer ce jeton d’accès ? Cette action est irréversible.</Typography>
        {deleteError && (
          <Box sx={{ marginTop: fr.spacing("2w") }}>
            <Alert description={deleteError} severity="error" small />
          </Box>
        )}
      </confirmDeleteModal.Component>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={copyState !== null}
        onClose={() => setCopyState(null)}
        autoHideDuration={copyState === true ? 3000 : null}
        sx={{
          textWrap: "wrap",
          overflowWrap: "anywhere",
          maxWidth: fr.breakpoints.values.sm,
          backgroundColor: fr.colors.decisions.background.default.grey.default,
          top: [`160px !important`, `160px !important`, `160px !important`, `200px !important`],
        }}
      >
        <Alert
          onClose={() => setCopyState(null)}
          description={
            copyState === false
              ? `Une erreur est survenue lors de la copie du jeton. Veuillez copier manuellement le jeton: ${apiKey.value}`
              : "Le jeton a été copié dans le presse papier"
          }
          closable
          severity={copyState === false ? "error" : "info"}
          small
        />
      </Snackbar>
    </Box>
  );
}
