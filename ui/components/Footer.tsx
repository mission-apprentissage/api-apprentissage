"use client";
import { Footer as DSFRFooter, FooterBottomItem } from "@codegouvfr/react-dsfr/Footer";
import Link from "next/link";
// import { usePlausible } from "next-plausible";
import React from "react";

import { publicConfig } from "@/config.public";
import { PAGES } from "@/utils/routes.utils";

const Footer = () => {
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
        href: PAGES.static.mentionsLegales.path,
      }}
      accessibilityLinkProps={{
        href: PAGES.static.accessibilite.path,
      }}
      bottomItems={[
        <FooterBottomItem
          key="cgu"
          bottomItem={{
            text: PAGES.static.cgu.title,
            linkProps: {
              href: PAGES.static.cgu.path,
            },
          }}
        />,
        <FooterBottomItem
          key="donnees-personnelles"
          bottomItem={{
            text: PAGES.static.donneesPersonnelles.title,
            linkProps: {
              href: PAGES.static.donneesPersonnelles.path,
            },
          }}
        />,
        <FooterBottomItem
          key="politique-confidentialite"
          bottomItem={{
            text: PAGES.static.politiqueConfidentialite.title,
            linkProps: {
              href: PAGES.static.politiqueConfidentialite.path,
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
      ]}
    />
  );
};

export default Footer;
