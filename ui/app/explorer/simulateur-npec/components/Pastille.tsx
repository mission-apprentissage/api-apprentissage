import { fr, SpacingToken } from "@codegouvfr/react-dsfr";
import { Typography } from "@mui/material";
import { PropsWithChildren } from "react";

export function Pastille({ children, size }: PropsWithChildren<{ size?: SpacingToken }>) {
  return (
    <Typography
      sx={{
        width: fr.spacing(size ?? "6w"),
        height: fr.spacing(size ?? "6w"),
        textAlign: "center",
        lineHeight: fr.spacing(size ?? "6w"),
        background: fr.colors.decisions.background.contrast.blueEcume.default,
        borderRadius: "100%",
      }}
      color={fr.colors.decisions.artwork.minor.blueEcume.default}
    >
      {children}
    </Typography>
  );
}
