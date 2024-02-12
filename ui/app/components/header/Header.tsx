import { Header as DSFRHeader, HeaderProps } from "@codegouvfr/react-dsfr/Header";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo } from "react";

import { publicConfig } from "../../../config.public";
import { useAuth } from "../../../context/AuthContext";
import { apiGet } from "../../../utils/api.utils";
import { PAGES } from "../breadcrumb/Breadcrumb";
import { useNavigationItems } from "./header.utils";

export const Header = () => {
  const { user, setUser } = useAuth();
  const { push } = useRouter();
  const pathname = usePathname();

  const handleLogout = useCallback(async () => {
    await apiGet("/auth/logout", {});
    setUser();
    push(PAGES.homepage().path);
  }, [setUser, push]);

  const navigation = useNavigationItems({ user, pathname });

  const loggedOut: HeaderProps.QuickAccessItem[] = useMemo(
    () => [
      {
        iconId: "fr-icon-lock-line",
        linkProps: {
          href: PAGES.connexion().path,
        },
        text: "Se connecter",
      },
    ],
    []
  );

  const loggedIn: HeaderProps.QuickAccessItem[] = useMemo(
    () => [
      {
        linkProps: {
          href: PAGES.compteProfil().path,
        },
        iconId: "fr-icon-account-line",
        text: "Mon compte",
      },
      {
        buttonProps: {
          onClick: handleLogout,
        },
        text: "Se deconnecter",
        iconId: "fr-icon-logout-box-r-line",
      },
    ],
    [handleLogout]
  );

  return (
    <DSFRHeader
      brandTop={
        <>
          République
          <br />
          Française
        </>
      }
      homeLinkProps={{
        href: "/",
        title: `Accueil - ${publicConfig.productMeta.productName}`,
      }}
      quickAccessItems={user ? loggedIn : loggedOut}
      serviceTitle={publicConfig.productMeta.productName}
      navigation={navigation}
    />
  );
};
