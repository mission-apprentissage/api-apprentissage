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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dynamic: Record<string, (params: any) => IPage>;
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
    documentationTechniqueEssayer: {
      title: "Essayer l'API",
      path: "/documentation-technique/try",
      index: true,
    },
    explorerApi: {
      title: "Explorer l’API",
      path: "/explorer",
      index: true,
    },
    catalogueDesDonneesCertification: {
      title: "Liste des certifications réalisables en apprentissage",
      path: "/explorer/certifications",
      index: true,
    },
    simulateurNpec: {
      title: "Simulateur des Niveaux de Prise en Charge (NPEC)",
      path: "/explorer/simulateur-npec",
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
    adminProcessor: {
      title: "Administration du processeur",
      path: "/admin/processeur",
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
    adminProcessorJob: (name: string): IPage => ({
      title: `Job ${name}`,
      path: `/admin/processeur/job/${name}`,
      index: false,
    }),
    adminProcessorJobInstance: (params: { name: string; id: string }): IPage => ({
      title: `Tâche ${params.id}`,
      path: `/admin/processeur/job/${params.name}/${params.id}`,
      index: false,
    }),
    adminProcessorCron: (name: string): IPage => ({
      title: `CRON ${name}`,
      path: `/admin/processeur/cron/${name}`,
      index: false,
    }),
    adminProcessorCronTask: (params: { name: string; id: string }): IPage => ({
      title: `Tâche ${params.id}`,
      path: `/admin/processeur/cron/${params.name}/${params.id}`,
      index: false,
    }),
  },
  notion: {},
} as const satisfies IPages;
