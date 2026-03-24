"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Alert } from "@codegouvfr/react-dsfr/Alert";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { Box, Typography } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import type { IUserAdminView } from "shared/models/user.model";
import type { Jsonify } from "type-fest";
import { useCallback, useMemo, useState } from "react";

import { useDeleteUser } from "@/app/[lang]/admin/hooks/useDeleteUser";
import type { WithLang } from "@/app/i18n/settings";
import SearchBar from "@/components/SearchBar";
import { Table } from "@/components/table/Table";
import { apiGet } from "@/utils/api.utils";
import { formatNullableDate } from "@/utils/date.utils";
import { formatUrlWithNewParams, getSearchParamsForQuery } from "@/utils/query.utils";
import { PAGES } from "@/utils/routes.utils";

const UserList = ({ lang }: WithLang) => {
  const searchParams = useSearchParams();
  const { push } = useRouter();
  const deleteUser = useDeleteUser();
  const [selectedUser, setSelectedUser] = useState<{ id: string; email: string } | null>(null);

  const modal = useMemo(
    () =>
      createModal({
        id: "confirm-delete-user-modal",
        isOpenedByDefault: false,
      }),
    []
  );

  const { page: page, limit: limit, q: searchValue } = getSearchParamsForQuery(searchParams);

  const result = useQuery<Jsonify<IUserAdminView>[]>({
    queryKey: ["/_private/admin/users", { searchValue, page, limit }],
    queryFn: async () => {
      const data = await apiGet("/_private/admin/users", {
        querystring: { q: searchValue, page, limit },
      });

      return data;
    },
  });

  if (result.isError) {
    throw result.error;
  }

  const { data: users } = result;

  const onSearch = (q: string) => {
    const url = formatUrlWithNewParams(PAGES.static.adminUsers.getPath(lang), searchParams, {
      q,
      page,
      limit,
    });

    push(url);
  };

  const handleDeleteClick = (id: string, email: string) => {
    setSelectedUser({ id, email });
    modal.open();
  };

  const handleConfirmDelete = useCallback(() => {
    if (selectedUser) {
      deleteUser.mutate(
        { id: selectedUser.id },
        {
          onSuccess: () => {
            modal.close();
          },
        }
      );
    }
  }, [deleteUser, selectedUser, modal]);

  const deleteError = deleteUser.isError ? "Une erreur est survenue lors de la suppression." : null;

  return (
    <>
      <SearchBar onButtonClick={onSearch} defaultValue={searchParams.get("q") ?? ""} />

      <Table
        rows={users || []}
        columns={[
          {
            field: "email",
            headerName: "Email",
            flex: 1,
          },
          {
            field: "organisation",
            headerName: "Organisation",
            flex: 1,
          },
          {
            field: "type",
            headerName: "Type",
            flex: 1,
          },
          {
            field: "is_admin",
            headerName: "Administrateur",
            valueGetter: (value) => (value ? "Oui" : "Non"),
            minWidth: 150,
          },
          {
            field: "api_keys",
            headerName: "Dernière utilisation API",
            valueGetter: (value: Jsonify<IUserAdminView>["api_keys"]) => {
              const lastUsedAt = value.reduce<Date | null>((acc, key) => {
                if (key.last_used_at === null) return acc;
                const d = new Date(key.last_used_at);
                if (acc === null) return d;
                return acc.getTime() > d.getTime() ? acc : d;
              }, null);
              return formatNullableDate(lastUsedAt, "PPP à p");
            },
            minWidth: 180,
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            getActions: ({ row: { _id, email } }) => [
              <Button
                key="view"
                iconId="fr-icon-arrow-right-line"
                linkProps={{
                  href: PAGES.dynamic.adminUserView(_id).getPath(lang),
                }}
                priority="tertiary no outline"
                title="Voir l'utilisateur"
              />,
              <Button
                key="delete"
                iconId="fr-icon-close-line"
                priority="tertiary no outline"
                title="Supprimer l'utilisateur"
                nativeButtonProps={modal.buttonProps}
                onClick={() => handleDeleteClick(_id, email)}
              />,
            ],
          },
        ]}
      />

      <modal.Component
        title={`Supprimer l'utilisateur "${selectedUser?.email}" ?`}
        buttons={[
          {
            children: "Annuler",
            disabled: deleteUser.isPending,
          },
          {
            onClick: handleConfirmDelete,
            children: "Confirmer la suppression",
            disabled: deleteUser.isPending,
            doClosesModal: false,
          },
        ]}
      >
        <Typography>Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.</Typography>
        {deleteError && (
          <Box sx={{ marginTop: fr.spacing("2w") }}>
            <Alert description={deleteError} severity="error" small />
          </Box>
        )}
      </modal.Component>
    </>
  );
};

export default UserList;
