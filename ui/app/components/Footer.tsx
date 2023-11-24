import { Footer as DSFRFooter, FooterBottomItem } from "@codegouvfr/react-dsfr/Footer";
import Link from "next/link";
// import { usePlausible } from "next-plausible";
import React from "react";

import { publicConfig } from "../../config.public";
import { PAGES } from "./breadcrumb/Breadcrumb";

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
        href: PAGES.mentionsLegales().path,
      }}
      accessibilityLinkProps={{
        href: PAGES.accessibilite().path,
      }}
      bottomItems={[
        <FooterBottomItem
          key="cgu"
          bottomItem={{
            text: PAGES.cgu().title,
            linkProps: {
              href: PAGES.cgu().path,
            },
          }}
        />,
        <FooterBottomItem
          key="donnees-personnelles"
          bottomItem={{
            text: PAGES.donneesPersonnelles().title,
            linkProps: {
              href: PAGES.donneesPersonnelles().path,
            },
          }}
        />,
        <FooterBottomItem
          key="page-aide"
          bottomItem={{
            text: "Page d'aide",
            linkProps: {
              target: "_blank",
              rel: "noopener noreferrer",
              href: "https://www.notion.so/mission-apprentissage/Documentation-dbb1eddc954441eaa0ba7f5c6404bdc0",
            },
          }}
        />,
        <FooterBottomItem
          key="politique-confidentialite"
          bottomItem={{
            text: PAGES.politiqueConfidentialite().title,
            linkProps: {
              href: PAGES.politiqueConfidentialite().path,
            },
          }}
        />,
        <FooterBottomItem
          key="a-propos"
          bottomItem={{
            text: "À propos",
            linkProps: {
              href: "https://beta.gouv.fr/startups",
            },
          }}
        />,
        <FooterBottomItem
          key="journal-evolution"
          bottomItem={{
            text: "Journal des évolutions",
            linkProps: {
              href: `https://github.com/mission-apprentissage/${publicConfig.productMeta.repoName}/releases`,
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
          key="code-source"
          bottomItem={{
            text: "Code source",
            linkProps: {
              href: `https://github.com/mission-apprentissage/${publicConfig.productMeta.repoName}`,
            },
          }}
        />,
        <FooterBottomItem
          key="version"
          bottomItem={{
            text: `v.${publicConfig.version} © République française ${new Date().getFullYear()}`,
            linkProps: {
              href: `https://github.com/mission-apprentissage/${publicConfig.productMeta.repoName}/releases/tag/v${publicConfig.version}`,
            },
          }}
        />,
      ]}
    />
  );
};

export default Footer;
