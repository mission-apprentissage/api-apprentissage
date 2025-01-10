# Ajouter une route passe plat LBA

## Prérequis

- Avoir suivi la [documentation de développement](./developpement.md)

> [!CAUTION]
> Le code de l'API a une structure spéciale due à la publication de la librairie. Ainsi les packages `sdk` & `shared` doivent etre build (`yarn typecheck`) pour répercuter les changements sur le server et l'ui.
> Cependant, la commande `yarn dev` watch egalement les changements de ces packages.
> Par contre, pour lancer les tests `yarn test` veuillez build les packages `sdk` & `shared` avant.

## Structure du Code

La majorité du code relatif à la définition des routes et de la documentation se trouve dans le package `sdk`.

- `src/`: Contient l'ensemble du code source
  - `docs/`: Contient l'ensemble de la documentation textuel gérés par le métier dans les 2 langues
    - `models/*/*.model.doc.ts`: Contient les contenu textuels métier des modèles
    - `routes/*/*.route.doc.ts`: Contient les contenu textuels métier des routes
    - `**/*.md`: Un contenu markdown pour etre utilisé dans la documentation
    - `**/*.ts`: Le code généré contenant le markdown associé (`yarn markdown:transpile`)
  - `models/`: Contient les définitions des modèles
    - `*/*.model.ts`: Schema zod et type typescript
    - `*/*.model.openapi.ts`: Schema openapi (sans le contenu textuel) et méthode de création du schema par langue
  - `routes/`: Contient les définitions des routes
    - `*/*.route.ts`: Schema de définition de la route et méthode de méthode de création du schema openapi par langue
    - `*/*.route.openapi.ts`: Définition de la route openapi (sans le contenu textuel) et méthode de création du schema par langue

## Création de la route

1. Création de la définition de la route dans `sdk/src/routes/<nom du domaine>/<nom de la route>.routes.ts`. (ex: `sdk/src/routes/jobs/job.routes.ts`)
   1. Utiliser `z.unknown()` pour les champs `body`, `response` & `querystring`. Pour `params`, entrer le type correctement.
   2. Ne pas oublier d'exporter la route dans le fichier `sdk/src/routes/index.ts`.
2. Ajouter la définition de la route avec le security scheme dans `shared/src/routes/<nom de la route>.ts`. (ex: `shared/src/routes/job.routes.ts`)
   1. Ne pas oublier d'exporter la route dans le fichier `shared/src/routes/index.ts`.
   2. Si une nouvelle permission est nécessaire, la créer dans le fichier `shared/src/security/permissions.ts`.
3. Ajouter la route dans le fichier `server/src/server/routes/<nom du domaine>/<nom de la route>.routes.ts` (ex: `server/src/server/routes/job/job.routes.ts`)
   1. Utiliser `forwardApiRequest` pour les routes passe-plat.
   2. Attention de bien passer le `Content-Type` adéquat, pour le parsing des data en `json` coté LBA.
   3. Ajustement des regles de sécurité si nécessaire (`bodyLimit`, `modsec`, ...).
   4. Ne pas oublier d'ajouter la route dans `server/src/server/server.ts`.
4. Ajouter les tests unitaire vérifiant
   1. Authentification requise
   2. Vérification des permissions utilisateur (si nécessaire)
   3. Vérification d'une requete simple

Exemple de Pull Request: https://github.com/mission-apprentissage/api-apprentissage/pull/284

## Création de la documentation
