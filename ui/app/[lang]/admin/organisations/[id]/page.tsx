"use client";

import { useQuery } from "@tanstack/react-query";
import type { IOrganisation } from "shared/models/organisation.model";
import type { Jsonify } from "type-fest";

import Loading from "@/app/[lang]/loading";
import { NotFound } from "@/icons/NotFound";
import { apiGet } from "@/utils/api.utils";

import OrganisationView from "./components/OrganisationView";

interface Props {
  params: { id: string };
}

type Result<T> = { isLoading: true } | { isLoading: false; data: T };

function useOrganisation(id: string): Result<Jsonify<IOrganisation | null>> {
  const result = useQuery({
    queryKey: ["/_private/admin/organisations"],
    queryFn: async () => {
      return apiGet(`/_private/admin/organisations`, {});
    },
  });

  if (result.isError) {
    throw result.error;
  }

  if (result.isLoading || result.isPending) {
    return { isLoading: true };
  }

  return { isLoading: false, data: result.data.find((o) => o._id === id) ?? null };
}

const AdminOrganisationViewPage = ({ params }: Props) => {
  const organisationResult = useOrganisation(params.id);

  if (organisationResult.isLoading) {
    return <Loading />;
  }

  if (organisationResult.data === null) {
    return <NotFound />;
  }

  return <OrganisationView organisation={organisationResult.data} />;
};

export default AdminOrganisationViewPage;
