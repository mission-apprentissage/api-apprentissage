"use client";

import { useQuery } from "@tanstack/react-query";

import Loading from "@/app/loading";
import { Table } from "@/components/table/Table";
import { apiGet } from "@/utils/api.utils";

import { CreateOrganisation } from "./CreateOrganisation";

export default function OrganisationList() {
  const result = useQuery({
    queryKey: ["/_private/admin/organisations"],
    queryFn: async () => apiGet("/_private/admin/organisations", {}),
  });

  if (result.isError) {
    throw result.error;
  }

  if (result.isLoading || result.isPending) {
    return <Loading />;
  }

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
        ]}
      />
    </>
  );
}