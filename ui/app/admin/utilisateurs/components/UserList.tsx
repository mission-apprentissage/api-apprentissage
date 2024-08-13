"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { IUserPublic } from "shared/models/user.model";

import SearchBar from "@/components/SearchBar";
import { Table } from "@/components/table/Table";
import { apiGet } from "@/utils/api.utils";
import { formatDate } from "@/utils/date.utils";
import { formatUrlWithNewParams, getSearchParamsForQuery } from "@/utils/query.utils";
import { PAGES } from "@/utils/routes.utils";

const UserList = () => {
  const searchParams = useSearchParams();
  const { push } = useRouter();

  const { page: page, limit: limit, q: searchValue } = getSearchParamsForQuery(searchParams);

  const result = useQuery<IUserPublic[]>({
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
    const url = formatUrlWithNewParams(PAGES.static.adminUsers.path, searchParams, {
      q,
      page,
      limit,
    });

    push(url);
  };

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
            field: "is_admin",
            headerName: "Administrateur",
            valueGetter: (value) => (value ? "Oui" : "Non"),
            minWidth: 150,
          },
          {
            field: "api_key_used_at",
            headerName: "Dernière utilisation API",
            valueGetter: (value) => {
              return value ? formatDate(value as unknown as string, "PPP à p") : "Jamais";
            },
            minWidth: 180,
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            getActions: ({ row: { _id } }) => [
              <Button
                key="view"
                iconId="fr-icon-arrow-right-line"
                linkProps={{
                  href: PAGES.dynamic.adminUserView(_id).path,
                }}
                priority="tertiary no outline"
                title="Voir l'utilisateur"
              />,
            ],
          },
        ]}
      />
    </>
  );
};

export default UserList;
