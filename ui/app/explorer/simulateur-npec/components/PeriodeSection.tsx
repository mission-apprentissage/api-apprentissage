"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { Box, Typography } from "@mui/material";
import { ChangeEvent, useCallback, useState } from "react";

import { Pastille } from "./Pastille";

type PeriodeSectionProps = {
  onDateSignatureChanged: (date: Date | null) => unknown;
};

export function PeriodeSection(props: PeriodeSectionProps) {
  const [error, setError] = useState<string | null>(null);

  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const start = new Date("2019-01-01");
      const end = new Date();
      end.setFullYear(end.getFullYear() + 1);

      if (event.target.value === "") {
        setError("La date de signature obligatoire");
        props.onDateSignatureChanged(null);
      }

      const value = new Date(event.target.value);

      if (isNaN(value.getTime())) {
        setError("La date de signature n'est pas valide");
        props.onDateSignatureChanged(null);
        return;
      }

      if (value < start || value > end) {
        setError(
          `La date doit être comprise entre le ${start.toLocaleDateString("fr-FR")} et le ${end.toLocaleDateString("fr-FR")}`
        );
        props.onDateSignatureChanged(null);
        return;
      }

      setError(null);
      props.onDateSignatureChanged(value);
    },
    [props.onDateSignatureChanged]
  );

  return (
    <Box sx={{ display: "flex", gap: fr.spacing("2w"), flexDirection: "column" }}>
      <Pastille>3</Pastille>
      <Typography
        className={fr.cx("fr-text--lead", "fr-text--bold")}
        sx={{ color: fr.colors.decisions.artwork.minor.blueEcume.default }}
      >
        Période du contrat d'apprentissage
      </Typography>
      <Input
        label="Date de signature"
        nativeInputProps={{ type: "date", onBlur: onChange }}
        state={error ? "error" : "default"}
        stateRelatedMessage={error}
      />
    </Box>
  );
}
