"use client"

import { fr } from "@codegouvfr/react-dsfr"
import { Alert } from "@codegouvfr/react-dsfr/Alert"
import { createModal } from "@codegouvfr/react-dsfr/Modal"
import { Box, Snackbar, Typography } from "@mui/material"
import { captureException } from "@sentry/nextjs"
import { useCallback, useMemo, useState } from "react"
import type { IApiKeyPrivateJson } from "shared/models/user.model"

import { useDeleteApiKeyMutation } from "@/app/[lang]/compte/profil/hooks/useDeleteApiKeyMutation"
import type { WithLangAndT } from "@/app/i18n/settings"
import { PopoverMenu } from "@/components/popoverMenu/PopoverMenu"
import { ApiError } from "@/utils/api.utils"

export function ApiKeyAction({ apiKey, lang, t }: WithLangAndT<{ apiKey: IApiKeyPrivateJson }>) {
  const deleteMutation = useDeleteApiKeyMutation()
  const [copyState, setCopyState] = useState<boolean | null>(null)

  const modal = useMemo(
    () =>
      createModal({
        id: `confirm-delete-modal-${apiKey._id}`,
        isOpenedByDefault: false,
      }),
    [apiKey._id]
  )

  const onClick = useCallback(() => {
    if (apiKey.value) {
      // This component is client-side only, so we can safely use navigator.clipboard
      navigator.clipboard
        .writeText(apiKey.value)
        .then(() => {
          setCopyState(true)
        })
        .catch((err) => {
          console.error(err)
          captureException(err)
          setCopyState(false)
        })
    }
  }, [apiKey])

  const onDeleteConfirm = useCallback(() => {
    deleteMutation.mutate(
      { id: apiKey._id },
      {
        onSuccess: () => {
          modal.close()
        },
      }
    )
  }, [deleteMutation, apiKey._id, modal])

  const { error } = deleteMutation
  const deleteError = useMemo(() => {
    const defaultErrorMessage = "Une erreur est survenue lors de la suppression du jeton. Veuillez réessayer ultérieurement."
    if (error) {
      if (error instanceof ApiError && error.context.statusCode < 500) {
        return error.context.message ?? defaultErrorMessage
      }
      captureException(error)

      return defaultErrorMessage
    }
  }, [error])

  return (
    <Box sx={{ display: "flex", gap: fr.spacing("1w"), flexWrap: "wrap" }}>
      <PopoverMenu
        title={t("monCompte.action", { lng: lang })}
        actions={[
          {
            type: "button",
            label: t("monCompte.copierJeton", { lng: lang }),
            icon: <i className={fr.cx("fr-icon-clipboard-line")} />,
            // Un jeton expiré n'a pas de valeur à copier : l'action reste visible mais inerte
            disabled: !apiKey.value,
            onClick,
          },
          {
            type: "button",
            label: t("monCompte.supprimer", { lng: lang }),
            icon: <i className={fr.cx("fr-icon-delete-line")} />,
            onClick: () => modal.open(),
          },
        ]}
      />
      <modal.Component
        title={`${t("monCompte.supprimerJeton", { lng: lang })}"${apiKey.name}"`}
        buttons={[
          {
            children: t("monCompte.annuler", { lng: lang }),
            disabled: deleteMutation.isPending,
          },
          {
            onClick: onDeleteConfirm,
            children: t("monCompte.supprimer", { lng: lang }),
            disabled: deleteMutation.isPending,
            doClosesModal: false,
          },
        ]}
      >
        <Typography>{t("monCompte.etesVousSurDeSupprimerJeton", { lng: lang })}</Typography>
        {deleteError && (
          <Box sx={{ marginTop: fr.spacing("2w") }}>
            <Alert description={deleteError} severity="error" small />
          </Box>
        )}
      </modal.Component>
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
          description={copyState === false ? `${t("monCompte.erreurCopieJeton", { lng: lang })} ${apiKey.value}` : t("monCompte.jetonCopiePressePapier", { lng: lang })}
          closable
          severity={copyState === false ? "error" : "info"}
          small
        />
      </Snackbar>
    </Box>
  )
}
