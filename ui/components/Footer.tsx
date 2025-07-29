"use client";
import { Footer as DSFRFooter, FooterBottomItem } from "@codegouvfr/react-dsfr/Footer";
import Link from "next/link";
import { useTranslation } from "react-i18next";

import type { WithLang } from "@/app/i18n/settings";
// import { usePlausible } from "next-plausible";
import { publicConfig } from "@/config.public";
import { PAGES } from "@/utils/routes.utils";

export default function Footer({ lang }: WithLang) {
  const { t } = useTranslation("global", { lng: lang });

  return (
    <DSFRFooter
      accessibility="partially compliant"
      contentDescription={
        <span>
          Mandatée par plusieurs ministères, la{" "}
          <Link href="https://beta.gouv.fr/startups/?incubateur=mission-apprentissage">
            Mission interministérielle pour l'apprentissage
          </Link>{" "}
          développe plusieurs services destinés à faciliter les entrées en apprentissage.
        </span>
      }
      operatorLogo={{
        alt: "Logo France Relance",
        imgUrl: "/images/france_relance.svg",
        orientation: "vertical",
      }}
      websiteMapLinkProps={{
        href: "/sitemap.xml",
      }}
      termsLinkProps={{
        href: PAGES.static.mentionsLegales.getPath(lang),
      }}
      accessibilityLinkProps={{
        href: PAGES.static.accessibilite.getPath(lang),
      }}
      bottomItems={[
        <FooterBottomItem
          key="cgu"
          bottomItem={{
            text: PAGES.static.cgu.getTitle(lang, t),
            linkProps: {
              href: PAGES.static.cgu.getPath(lang),
            },
          }}
        />,
        <FooterBottomItem
          key="politique-confidentialite"
          bottomItem={{
            text: PAGES.static.politiqueConfidentialite.getTitle(lang, t),
            linkProps: {
              href: PAGES.static.politiqueConfidentialite.getPath(lang),
            },
          }}
        />,
        <FooterBottomItem
          key="code-source"
          bottomItem={{
            text: "Code source",
            linkProps: {
              href: `https://github.com/mission-apprentissage/${publicConfig.productMeta.repoName}`,
            },
          }}
        />,
        <FooterBottomItem
          key="statistiques"
          bottomItem={{
            text: "Statistiques",
            linkProps: {
              href: `http://api.apprentissage.beta.gouv.fr/metabase/public/dashboard/240019b1-0f17-4e7c-bf52-a297476d486f`,
            },
          }}
        />,
      ]}
    />
  );
}
