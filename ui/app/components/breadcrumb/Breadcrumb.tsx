import { Breadcrumb as DSFRBreadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import React, { FC } from "react";

export const NOTION_PAGES = {
  homepage: {
    title: "Accueil",
    path: "/",
    notionId: "4b61748235d642f58cd73111f1f0423d",
  },
  donnees_disponibles: {
    title: "Données disponibles",
    path: "/doc/donnees_disponibles",
    notionId: "321f3275b3394b838e2ef95df3bac056",
  },
  "/donnees/certifications_professionnelles": {
    title: "Certifications professionnelles réalisables en apprentissage",
    path: "/doc/donnees/certifications_professionnelles",
    notionId: "3bf833e84fb04e1aadcfb00d4a106bdc",
  },
  "/donnees/diplomes_titres": {
    title: "Diplômes et titres réalisables en apprentissage",
    path: "/doc/donnees/diplomes_titres",
    notionId: "02a04b5f988f49379ab415cd35a86c3d",
  },
  "/donnees/correspondance_RNCP_CFD": {
    title: "Correspondance RNCP et CFD",
    path: "/doc/donnees/correspondance_RNCP_CFD",
    notionId: "653bab8a42f4419a9bac2fd4d6725cce",
  },
} as const satisfies Record<string, NotionPage>;

export const PAGES = {
  homepage: (): Page => NOTION_PAGES.homepage,
  mentionsLegales: (): Page => ({
    title: "Mentions Légales",
    path: "/mentions-legales",
  }),
  accessibilite: (): Page => ({
    title: "Accessibilité",
    path: "/accessibilite",
  }),
  cgu: (): Page => ({
    title: "Conditions Générales d'Utilisation",
    path: "/cgu",
  }),
  donneesPersonnelles: (): Page => ({
    title: "Données Personnelles",
    path: "/donnees-personnelles",
  }),
  politiqueConfidentialite: (): Page => ({
    title: "Politique de Confidentialité",
    path: "/politique-confidentialite",
  }),
  connexion: (): Page => ({
    title: "Se connecter",
    path: "/auth/connexion",
  }),
  motDePasseOublie: (): Page => ({
    title: "Mot de passe oublié",
    path: "/auth/mot-de-passe-oublie",
  }),
  modifierMotDePasse: (): Page => ({
    title: "Modifier mon mot de passe",
    path: "/modifier-mot-de-passe",
  }),
  compteProfil: (): Page => ({
    title: "Mon profil",
    path: "/compte/profil",
  }),
  adminUsers: (): Page => ({
    title: "Gestion des utilisateurs",
    path: "/admin/utilisateurs",
  }),
  adminUserView: (id: string): Page => ({
    title: "Fiche utilisateur",
    path: `/admin/utilisateurs/${id}`,
  }),
} as const;

export interface Page {
  title: string;
  path: string;
}

export interface NotionPage extends Page {
  notionId: string;
}

interface Props {
  pages: Page[];
}

const Breadcrumb: FC<Props> = ({ pages }) => {
  const currentPage = pages.pop();

  return (
    <DSFRBreadcrumb
      currentPageLabel={currentPage?.title}
      homeLinkProps={{
        href: PAGES.homepage().path,
      }}
      segments={pages.map((page) => ({
        label: page.title,
        linkProps: {
          href: page.path,
        },
      }))}
    />
  );
};

export default Breadcrumb;
