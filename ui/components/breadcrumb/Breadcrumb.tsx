import { Breadcrumb as DSFRBreadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import React, { FC } from "react";

export const NOTION_PAGES = {
  homepage: {
    title: "Accueil",
    path: "/",
    notionId: "4b61748235d642f58cd73111f1f0423d",
  },
} as const satisfies Record<string, NotionPage>;

export const PAGES = {
  homepage: (): Page => NOTION_PAGES.homepage,
  documentationTechnique: (): Page => ({
    title: "Documentation technique",
    path: "/documentation-technique",
  }),
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
  compteProfil: (): Page => ({
    title: "Mon profil",
    path: "/compte/profil",
  }),
  inscription: (token: string): Page => ({
    title: "Mon profil",
    path: `/auth/inscription?token=${token}`,
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
