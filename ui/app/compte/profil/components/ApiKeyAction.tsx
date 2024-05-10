import { fr } from "@codegouvfr/react-dsfr";
import Alert from "@codegouvfr/react-dsfr/Alert";
import Button from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Box, Snackbar, Typography } from "@mui/material";
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
    if (!apiKey.value) {
      confirmDeleteModal.open();
    } else {
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
      console.error(error);
      if (error instanceof ApiError && error.context.statusCode < 500) {
        return error.context.message ?? defaultErrorMessage;
      }
      captureException(error);

      return defaultErrorMessage;
    }
  }, [deleteMutation.error]);

  return (
    <>
      <Button key="action" onClick={onClick}>
        {apiKey.value ? "Copier le jeton" : "Supprimer le jeton"}
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
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        open={copyState !== null}
        onClose={() => setCopyState(null)}
        autoHideDuration={copyState === true ? 3000 : null}
        sx={{
          textWrap: "wrap",
          overflowWrap: "anywhere",
          maxWidth: fr.breakpoints.values.sm,
        }}
        message={
          copyState === false
            ? `Une erreur est survenue lors de la copie du jeton. Veuillez copier manuellement le jeton: ${apiKey.value}`
            : "Le jeton a été copié dans le presse papier"
        }
      />
    </>
  );
}
