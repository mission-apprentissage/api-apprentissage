"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { zRoutes } from "shared";

import Loading from "@/app/loading";
import { apiGet } from "@/utils/api.utils";

import { CertificationSection } from "./CertificationSection";
import { EntrepriseSection } from "./EntrepriseSection";
import { PeriodeSection } from "./PeriodeSection";
import { ResultSection, ResultSectionProps } from "./ResultSection";

export function SimulateurNpecContrat() {
  const result = useQuery({
    queryKey: [zRoutes.get["/_private/simulateur/context"]],
    queryFn: async () => {
      return apiGet("/_private/simulateur/context", {});
    },
  });

  const [data, setData] = useState<ResultSectionProps>({
    rncp: null,
    idcc: null,
    date_signature: null,
  });

  const onDateSignatureChanged = (date_signature: Date | null) =>
    setData((d) => {
      if (date_signature?.getTime() === d.date_signature?.getTime()) return d;
      return { ...d, date_signature };
    });

  if (result.isError) {
    throw result.error;
  }

  if (result.isPending) {
    return <Loading />;
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: fr.spacing("5w"),
        border: "1px solid",
        padding: fr.spacing("9w"),
        paddingTop: fr.spacing("6w"),
        borderColor: fr.colors.decisions.border.default.blueFrance.default,
      }}
    >
      <CertificationSection onRncpChanged={(rncp) => setData((d) => ({ ...d, rncp }))} rncps={result.data.rncps} />
      <EntrepriseSection
        onIdccChanged={(idcc) => setData((d) => ({ ...d, idcc }))}
        conventions_collectives={result.data.conventions_collectives}
      />
      <PeriodeSection onDateSignatureChanged={onDateSignatureChanged} />
      <ResultSection {...data} />
    </Box>
  );
}
