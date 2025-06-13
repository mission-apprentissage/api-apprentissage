"use client";

import { useQuery } from "@tanstack/react-query";
import { use } from "react";
import type { IOrganisationInternal } from "shared/models/organisation.model";
import type { Jsonify } from "type-fest";

import { OrganisationView } from "./components/OrganisationView";
import Loading from "@/app/[lang]/loading";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import { NotFound } from "@/icons/NotFound";
import { apiGet } from "@/utils/api.utils";

type Result<T> = { isLoading: true } | { isLoading: false; data: T };

function useOrganisation(id: string): Result<Jsonify<IOrganisationInternal | null>> {
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

export default function AdminOrganisationViewPage({ params }: PropsWithLangParams<{ id: string }>) {
  const { id, lang } = use(params);
  const organisationResult = useOrganisation(id);

  if (organisationResult.isLoading) {
    return <Loading />;
  }

  if (organisationResult.data === null) {
    return <NotFound />;
  }

  return <OrganisationView organisation={organisationResult.data} lang={lang} />;
}
