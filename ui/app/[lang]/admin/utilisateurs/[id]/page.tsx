"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import type { IOrganisationInternal } from "shared/models/organisation.model";
import type { IUserAdminView } from "shared/models/user.model";
import type { Jsonify } from "type-fest";

import UserView from "./components/UserView";
import Loading from "@/app/[lang]/loading";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import { apiGet } from "@/utils/api.utils";

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
function useOrganisations(): Result<Jsonify<IOrganisationInternal[]>> {
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

export default function AdminUserViewPage({ params }: PropsWithLangParams<{ id: string }>) {
  const { id, lang } = use(params);
  const userResult = useUsers(id);
  const organisationResult = useOrganisations();

  if (userResult.isLoading || organisationResult.isLoading) {
    return <Loading />;
  }

  return <UserView user={userResult.data} organisations={organisationResult.data} lang={lang} />;
}
