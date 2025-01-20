"use client";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Typography } from "@mui/material";
import { use } from "react";
import { useTranslation } from "react-i18next";

import { useImporterStatus } from "@/app/[lang]/admin/hooks/useImporterStatus";
import Loading from "@/app/[lang]/loading";
import type { PropsWithLangParams } from "@/app/i18n/settings";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import { Table } from "@/components/table/Table";
import { formatNullableDate } from "@/utils/date.utils";
import { PAGES } from "@/utils/routes.utils";

export default function AdminImportersPage({ params }: PropsWithLangParams) {
  const { lang } = use(params);
  const { t } = useTranslation("global", { lng: lang });

  const result = useImporterStatus();

  if (result.isError) {
    throw result.error;
  }

  if (result.isLoading || result.isPending) {
    return <Loading />;
  }

  const rows = Object.entries(result.data).map(([name, status]) => ({ name, ...status }));

  return (
    <>
      <Breadcrumb pages={[PAGES.static.adminImporters]} lang={lang} t={t} />
      <Typography variant="h2" gutterBottom>
        {PAGES.static.adminImporters.getTitle(lang, t)}
      </Typography>
      <Table
        rows={rows}
        getRowId={(row) => row.name}
        columns={[
          {
            field: "name",
            headerName: "Name",
            flex: 2,
          },
          {
            field: "status",
            headerName: "Status",
            flex: 1,
          },
          {
            field: "last_import",
            headerName: "Last Import",
            flex: 1,
            valueGetter: (value) => formatNullableDate(value, "PPP à p"),
          },
          {
            field: "last_success",
            headerName: "Last Success",
            flex: 1,
            valueGetter: (value) => formatNullableDate(value, "PPP à p"),
          },
          {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            getActions: ({ row: { name, resources } }) => {
              if (resources.length === 0) {
                return [];
              }
              return [
                <Button
                  key="view"
                  iconId="fr-icon-arrow-right-line"
                  linkProps={{
                    href: PAGES.dynamic.adminImporterView(name).getPath(lang),
                  }}
                  priority="tertiary no outline"
                  title="Voir l'importer"
                />,
              ];
            },
          },
        ]}
      />
    </>
  );
}
