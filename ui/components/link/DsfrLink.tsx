import { fr } from "@codegouvfr/react-dsfr";
import { Box, Link } from "@mui/material";
import NextLink, { LinkProps } from "next/link";
import { ReactNode, useMemo } from "react";

import { publicConfig } from "@/config.public";

export function DsfrLink({
  children,
  noArrow = false,
  ...props
}: { children: ReactNode; noArrow?: boolean } & LinkProps) {
  const { href, ...rest } = props;

  const isExternal = useMemo(() => {
    if (typeof href !== "string") return false;
    const url = new URL(href, publicConfig.baseUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    return new URL(href, publicConfig.baseUrl).hostname !== publicConfig.host;
  }, [href]);

  return (
    <Link
      component={NextLink}
      sx={{
        textUnderlinePosition: "under",
      }}
      href={href}
      rel={isExternal ? "noopener noreferrer" : undefined}
      target={isExternal ? "_blank" : undefined}
      {...rest}
    >
      {children}
      {!noArrow && (
        <Box component="span" sx={{ display: "inline-block" }} mx={fr.spacing("1w")}>
          <i className={fr.cx("fr-icon-arrow-right-line", "fr-text--lg")} />
        </Box>
      )}
    </Link>
  );
}
