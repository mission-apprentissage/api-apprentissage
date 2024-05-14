export interface IPage {
  title: string;
  path: string;
  index: boolean;
}

export interface INotionPage extends IPage {
  notionId: string;
}

export interface IPages {
  static: Record<string, IPage>;
  dynamic: Record<string, (id: string) => IPage>;
  notion: Record<string, INotionPage>;
}

export const PAGES = {
  static: {
    home: {
      title: "Accueil",
      path: "/",
      index: true,
    },
    documentationTechnique: {
      title: "Documentation technique",
      path: "/documentation-technique",
      index: true,
    },
    catalogueDesDonnees: {
      title: "Catalogue des données",
      path: "/catalogue-des-donnees",
      index: true,
    },
    catalogueDesDonneesCertification: {
      title: "Liste des certifications réalisables en apprentissage",
      path: "/catalogue-des-donnees/certifications",
      index: true,
    },
    mentionsLegales: {
      title: "Mentions Légales",
      path: "/mentions-legales",
      index: true,
    },
    accessibilite: {
      title: "Accessibilité",
      path: "/accessibilite",
      index: true,
    },
    cgu: {
      title: "Conditions Générales d'Utilisation",
      path: "/cgu",
      index: true,
    },
    donneesPersonnelles: {
      title: "Données Personnelles",
      path: "/donnees-personnelles",
      index: true,
    },
    politiqueConfidentialite: {
      title: "Politique de Confidentialité",
      path: "/politique-confidentialite",
      index: true,
    },
    compteProfil: {
      title: "Mon profil",
      path: "/compte/profil",
      index: true,
    },
    adminUsers: {
      title: "Gestion des utilisateurs",
      path: "/admin/utilisateurs",
      index: false,
    },
  },
  dynamic: {
    inscription: (token: string): IPage => ({
      title: "Mon profil",
      path: `/auth/inscription?token=${token}`,
      index: false,
    }),
    adminUserView: (id: string): IPage => ({
      title: "Fiche utilisateur",
      path: `/admin/utilisateurs/${id}`,
      index: false,
    }),
  },
  notion: {},
} as const satisfies IPages;
