import { fr } from "@codegouvfr/react-dsfr";
import { Box, Link } from "@mui/material";
import NextLink, { LinkProps } from "next/link";
import { ReactNode } from "react";

export function DsfrLink({ children, ...props }: { children: ReactNode } & LinkProps) {
  return (
    <Link
      component={NextLink}
      sx={{
        textUnderlinePosition: "under",
      }}
      {...props}
    >
      {children}
      <Box component="span" sx={{ display: "inline-block" }} mx={fr.spacing("1w")}>
        <i className={fr.cx("fr-icon-arrow-right-line", "fr-text--lg")} />
      </Box>
    </Link>
  );
}
