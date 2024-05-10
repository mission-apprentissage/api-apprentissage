"use client";

import { fr } from "@codegouvfr/react-dsfr";
import { HeaderQuickAccessItem } from "@codegouvfr/react-dsfr/Header";
import { Box, Link, Popover, Typography } from "@mui/material";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { apiGet } from "@/utils/api.utils";
import { PAGES } from "@/utils/routes.utils";

export function MonCompteQuickAccess() {
  const { user, setUser } = useAuth();
  const { push } = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleLogout = useCallback(async () => {
    await apiGet("/_private/auth/logout", {});
    setUser(null);
    push(PAGES.static.home.path);
  }, []);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const isPopoverOpened = Boolean(anchorEl);
  const popoverId = isPopoverOpened ? "mon-compte-popover" : undefined;
  const pathname = usePathname();

  if (!user) {
    return (
      <HeaderQuickAccessItem
        quickAccessItem={{
          iconId: "fr-icon-lock-line",
          text: "Se connecter / S'inscrire",
          linkProps: {
            href: PAGES.static.compteProfil.path,
          },
        }}
      />
    );
  }

  return (
    <>
      <HeaderQuickAccessItem
        quickAccessItem={{
          iconId: "fr-icon-account-circle-fill",
          text: "Mon compte",
          buttonProps: {
            onClick: handleOpenPopover,
            "aria-describedby": popoverId,
          },
        }}
      />

      <Popover
        id={popoverId}
        open={isPopoverOpened}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        elevation={6}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: fr.spacing("2w"),
            padding: fr.spacing("2w"),
            marginBottom: fr.spacing("2w"),
          }}
        >
          <Typography>
            <Link
              sx={{
                textDecoration: "none",
                color:
                  pathname === PAGES.static.compteProfil.path
                    ? fr.colors.decisions.text.active.blueFrance.default
                    : fr.colors.decisions.text.mention.grey.default,
              }}
              component={NextLink}
              href={PAGES.static.compteProfil.path}
            >
              Jetons d'accès
            </Link>
          </Typography>
          <Box component="hr" sx={{ padding: 0, height: "1px" }} />
          <Typography sx={{ marginRight: fr.spacing("2w") }} color={fr.colors.decisions.text.mention.grey.default}>
            <strong>{user.email}</strong>
          </Typography>
          <Typography>
            <Link
              sx={{
                textDecoration: "none",
                color: fr.colors.decisions.text.mention.grey.default,
              }}
              onClick={handleLogout}
              href={PAGES.static.home.path}
            >
              <i className={fr.cx("fr-icon-logout-box-r-line")} />
              Déconnexion
            </Link>
          </Typography>
        </Box>
      </Popover>
    </>
  );
}
