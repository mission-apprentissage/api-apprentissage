"use client";

import Badge from "@codegouvfr/react-dsfr/Badge";
import { Header as DSFRHeader, HeaderQuickAccessItem } from "@codegouvfr/react-dsfr/Header";
import { LanguageSelect } from "@codegouvfr/react-dsfr/LanguageSelect";
import { useIsDark } from "@codegouvfr/react-dsfr/useIsDark";
import { margin } from "@mui/system";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

import type { Lang, WithLang } from "@/app/i18n/settings";
import { languages } from "@/app/i18n/settings";
import { publicConfig } from "@/config.public";
import { useAuth } from "@/context/AuthContext";

import { useNavigationItems } from "./header.utils";
import { MonCompteQuickAccess } from "./MonCompteQuickAccess";

export const Header = ({ lang }: WithLang) => {
  // Force light mode
  const { isDark, setIsDark } = useIsDark();
  useEffect(() => {
    if (isDark) {
      setIsDark(false);
    }
  }, [isDark, setIsDark]);

  const pathname = usePathname();

  const { session } = useAuth();

  const { t } = useTranslation("global", { lng: lang });
  const navigation = useNavigationItems({ user: session?.user ?? null, pathname, lang, t });

  const setLang = useCallback(
    async (locale: Lang) => {
      const newPath = window.location.pathname.replace(new RegExp(`^/${lang}`), `/${locale}`);
      window.location.assign(newPath);
    },
    [lang]
  );

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
        quickAccessItems={[
          <LanguageSelect
            key="language-switcher"
            supportedLangs={languages}
            lang={lang}
            setLang={setLang}
            fullNameByLang={{
              en: "English",
              fr: "Français",
            }}
          />,
          <HeaderQuickAccessItem
            key="status-page"
            quickAccessItem={{
              iconId: "fr-icon-sun-fill",
              text: "Status",
              linkProps: {
                href: "https://mission-apprentissage.github.io/upptime/history/api-apprentissage-api",
                target: "_blank",
                rel: "noopener noreferrer",
              },
            }}
          />,
          <MonCompteQuickAccess key="mon-compte-quick-access" lang={lang} t={t} />,
        ]}
        operatorLogo={{
          alt: "Retour à l'accueil",
          imgUrl: "/images/logo_LBA.svg",
          orientation: "horizontal",
        }}
        serviceTitle={<>Espace développeurs</>}
        navigation={navigation}
      />
    </>
  );
};
