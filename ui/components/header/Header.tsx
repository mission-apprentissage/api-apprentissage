"use client";

import { Header as DSFRHeader } from "@codegouvfr/react-dsfr/Header";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { publicConfig } from "../../config.public";
import { useAuth } from "../../context/AuthContext";
import { useNavigationItems } from "./header.utils";
import { MonCompteQuickAccess } from "./MonCompteQuickAccess";

export const Header = () => {
  // Force light mode
  const { isDark, setIsDark } = useIsDark();
  useEffect(() => {
    if (isDark) {
      setIsDark(false);
    }
  }, [isDark, setIsDark]);

  const pathname = usePathname();

  const { user } = useAuth();

  const navigation = useNavigationItems({ user, pathname });

  return (
    <>
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
          title: `Accueil - ${publicConfig.productMeta.brandName}`,
        }}
        quickAccessItems={[<MonCompteQuickAccess key="mon-compte-quick-access" />]}
        serviceTitle={publicConfig.productMeta.brandName}
        navigation={navigation}
      />
    </>
  );
};
