"use client";

import { useQuery } from "@tanstack/react-query";
import type { IOrganisation } from "shared/models/organisation.model";
import type { IUserAdminView } from "shared/models/user.model";
import type { Jsonify } from "type-fest";

import Loading from "@/app/loading";
import { apiGet } from "@/utils/api.utils";

import UserView from "./components/UserView";

interface Props {
  params: { id: string };
}

type Result<T> = { isLoading: true } | { isLoading: false; data: T };

function useUsers(id: string): Result<Jsonify<IUserAdminView>> {
  const result = useQuery({
    queryKey: ["/_private/admin/users", { id }],
    queryFn: async () => apiGet(`/_private/admin/users/:id`, { params: { id } }),
  });

  if (result.isError) {
    throw result.error;
  }

  if (result.isLoading || result.isPending) {
    return { isLoading: true };
  }

  return { isLoading: false, data: result.data };
}
function useOrganisations(): Result<Jsonify<IOrganisation[]>> {
  const result = useQuery({
    queryKey: ["/_private/admin/organisations"],
    queryFn: async () => apiGet(`/_private/admin/organisations`, {}),
  });

  if (result.isError) {
    throw result.error;
  }

  if (result.isLoading || result.isPending) {
    return { isLoading: true };
  }

  return { isLoading: false, data: result.data };
}

const AdminUserViewPage = ({ params }: Props) => {
  const userResult = useUsers(params.id);
  const organisationResult = useOrganisations();

  if (userResult.isLoading || organisationResult.isLoading) {
    return <Loading />;
  }

  return <UserView user={userResult.data} organisations={organisationResult.data} />;
};

export default AdminUserViewPage;
