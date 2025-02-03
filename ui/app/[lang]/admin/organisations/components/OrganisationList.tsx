"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import { useDeleteOrganisation } from "@/app/[lang]/admin/hooks/useDeleteOrganisation";
import Loading from "@/app/[lang]/loading";
import type { WithLang } from "@/app/i18n/settings";
import { Table } from "@/components/table/Table";
import { apiGet } from "@/utils/api.utils";
import { PAGES } from "@/utils/routes.utils";

import { CreateOrganisation } from "./CreateOrganisation";

export default function OrganisationList({ lang }: WithLang) {
  const deleteOrganisation = useDeleteOrganisation();
  const [selectedOrganisation, setSelectedOrganisation] = useState<{ id: string; name: string } | null>(null);

  const modal = useMemo(
    () =>
      createModal({
        id: "confirm-delete-organisation-modal",
        isOpenedByDefault: false,
      }),
    []
  );

  const result = useQuery({
    queryKey: ["/_private/admin/organisations"],
    queryFn: async () => apiGet("/_private/admin/organisations", {}),
  });

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedOrganisation({ id, name });
    modal.open();
  };

  const handleConfirmDelete = useCallback(() => {
    if (selectedOrganisation) {
      deleteOrganisation.mutate(
        { id: selectedOrganisation.id },
        {
          onSuccess: () => {
            modal.close();
          },
        }
      );
    }
  }, [deleteOrganisation, selectedOrganisation, modal]);

  const deleteError = deleteOrganisation.isError ? "Une erreur est survenue lors de la suppression." : null;

  return (
    <>
      <CreateOrganisation />
      <Table
        rows={result.data}
        columns={[
          {
            field: "nom",
            headerName: "Nom",
            flex: 1,
          },
          {
            field: "habilitations",
            headerName: "Habilitations",
            flex: 1,
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            getActions: ({ row: { _id, nom } }) => [
              <Button
                key="view"
                iconId="fr-icon-arrow-right-line"
                linkProps={{
                  href: PAGES.dynamic.adminOrganisationView(_id).getPath(lang),
                }}
                priority="tertiary no outline"
                title="Voir l'organisation"
              />,
              <Button
                key="delete"
                iconId="fr-icon-close-line"
                priority="tertiary no outline"
                title="Supprimer l'organisation"
                nativeButtonProps={modal.buttonProps}
                onClick={() => handleDeleteClick(_id, nom)}
              />,
            ],
          },
        ]}
      />

      <modal.Component
        title={`Supprimer l'organisation "${selectedOrganisation?.name}" ?`}
        buttons={[
          {
            children: "Annuler",
            disabled: deleteOrganisation.isPending,
          },
          {
            onClick: handleConfirmDelete,
            children: "Confirmer la suppression",
            disabled: deleteOrganisation.isPending,
            doClosesModal: false,
          },
        ]}
      >
        <Typography>
          Êtes-vous sûr de vouloir supprimer cette organisation ? Cette action est irréversible et tous les utilisateurs
          rattachés à cette organisation se retrouveront sans organisation.
        </Typography>
        {deleteError && (
          <Box sx={{ marginTop: fr.spacing("2w") }}>
            <Alert description={deleteError} severity="error" small />
          </Box>
        )}
      </modal.Component>
    </>
  );
}
