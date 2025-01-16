# Création d'une route API

Pour mettre à disposition une route API, il existe 2 cas d'usages:

- Mettre à disposition une route native à l'API Alternance
- Mettre à disposition une route passe-plat d'un acteur externe

De plus la création d'une route consiste en la mise à disposition:

- l'implementation de la route
- de la documentation technique (Swagger)
- de la documentation métier

## Prérequis

- Avoir suivi la [documentation de développement](./developpement.md)

> [!CAUTION]
> Le code de l'API a une structure spéciale due à la publication de la librairie. Ainsi les packages `sdk` & `shared` doivent etre build (`yarn typecheck`) pour répercuter les changements sur le server et l'ui.
> Cependant, la commande `yarn dev` watch egalement les changements de ces packages.
> Par contre, pour lancer les tests `yarn test` veuillez build les packages `sdk` & `shared` avant.

## Structure du code

Le code relatif à la définition des routes, et de la documentation se trouve dans le package `sdk`.

- `src/`: Contient l'ensemble du code source
  - `docs/`: Contient l'ensemble de la documentation textuel gérés par le métier dans les 2 langues
    - `metier/`: Contenu de la documentation métier des routes
      - `*/*.doc.ts`: Contient l'ensemble de la donnée utilisé pour construire une page métier
    - `models/*/*.model.doc.ts`: Contient les descriptions textuels des champs des modeles
    - `routes/*/*.route.doc.ts`: Contient les contenu textuels métier des routes
    - `**/*.md`: Un contenu markdown pour etre utilisé dans la documentation
    - `**/*.md.ts`: Le code généré contenant le markdown associé (`yarn workspace api-alternance-sdk markdown:transpile`)
  - `models/`: Contient les définitions des modèles
    - `*/*.model.ts`: Schema zod et type typescript
    - `*/*.model.openapi.ts`: Schema openapi (sans le contenu textuel) et méthode de création du schema par langue
  - `routes/`: Contient les définitions des routes
    - `*/*.route.ts`: Schema de définition de la route et méthode de méthode de création du schema openapi par langue
    - `*/*.route.openapi.ts`: Définition de la route openapi (sans le contenu textuel) et méthode de création du schema par langue
  - `openapi/openapiSpec.ts`: Définition de la documentation exposé dans le Swagger.

## Création d'une route passe-plat

### Implémentation

1. Création de la définition de la route dans `sdk/src/routes/<nom du domaine>/<nom de la route>.routes.ts`. (ex: `sdk/src/routes/jobs/job.routes.ts`)
   1. Utiliser `z.unknown()` pour les champs `body`, `response` & `querystring`. Pour `params`, vous devez les renseigner car elles sont utilisé dans le `path`.
   2. Ne pas oublier d'exporter la route dans le fichier `sdk/src/routes/index.ts`.
   3. Ne pas oublier d'ajouter la route dans la variable `zApiRoutes` du fichier `sdk/src/routes/index.ts`.
   4. En cas de besoin de nouvelle permissions, editer le fichier `sdk/src/routes/security/permissions.ts`
2. Ajouter la route dans le fichier `server/src/server/routes/<nom du domaine>/<nom de la route>.routes.ts` (ex: `server/src/server/routes/job/job.routes.ts`)
   1. Utiliser `forwardApiRequest` pour les routes passe-plat.
   2. Attention de bien passer le `Content-Type` adéquat, pour le parsing des data en `json` coté LBA.
   3. Ajustement des regles de sécurité si nécessaire (`bodyLimit`, `modsec`, ...).
   4. Ne pas oublier d'ajouter la route dans `server/src/server/server.ts`.
3. Ajouter les tests unitaire vérifiant
   1. Authentification requise
   2. Vérification des permissions utilisateur (si nécessaire)
   3. Vérification d'une requete simple

### Création de la documentation métier

1. Créer un nouveau document dans `sdk/src/metier/<nom-page>/<nom-page>.doc.ts`
   1. Pour la structure partir de page existante
   2. Pour du contenu markdown plus complex
      1. Créer des fichier `.md`
      2. Exécuter `yarn workspace api-alternance-sdk markdown:transpile`
      3. Importer le contenu du fichier `.ts` genéré.
   3. Les liens `href` des logos pointent vers des fichiers dans le dossier `ui/public/` et doivent donc etre créé en consequence.
   4. Exporter le fichier dans `sdk/src/docs/metier/internal.ts`
2. Ajouter la page à créer dans la variable `PAGES` du fichier `ui/utils/routes.utils.ts`
   1. Ne pas oublier d'ajouter les traductions du titre dans les fichiers `ui/app/i18n/locales/en/global.json` & `ui/app/i18n/locales/fr/global.json`
3. Ajouter le lien vers la nouvelle page dans le fichier `ui/app/[lang]/explorer/page.tsx`
4. Créer la page métier dans `ui/app/[lang]/explorer/<nom-page>/page.tsx`

### Création de la documenation technique

La documentation technique est plus complexe à maintenir car:

- La partie textuel et specification openapi sont dans des fichiers séparés, mais doivent cependant maintenir la meme structure. Cette contrainte est assurée par les tests du fichier `sdk/src/openapi/openapiSpec.test.ts`
- La spécification openapi est maintenu manuellement, mais doit etre cohérente avec les évolutions de la route externe. Cette contrainte est assurée par un CRON job `Controle synchronisation de la documentation`.

#### Création de la documentation technique des modeles

1. Générer le schema openapi et la doc technique à partir de la specification de l'API externe
   1. Copier le contenu de type `SchemaObject` depuis la doc openapi de l'API externe dans un fichier `./tmp/source.json`
   2. Lancer le build `yarn typecheck && yarn build:dev`
   3. Lancer la commande `yarn cli dev:doc:init:external:model ./tmp/source.json ./tmp/out.model.doc.json ./tmp/out.model.openapi.json`
   4. La command génère 2 fichiers:
      1. `./tmp/out.model.doc.json`: Contient la documentation technique des champs du model (à copier dans le fichier `sdk/src/docs/models/<nom>/<nom>.model.doc.ts`)
      2. `./tmp/out.model.openapi.json`: Contient la définition du model openapi (à utiliser pour la propriété `schema` du model dans le fichier `sdk/src/models/<nom>/<nom>.model.openapi.ts`)
2. Créer les spécifications des models utilisés dans la spec openapi dans un fichier `sdk/src/models/<nom>/<nom>.model.openapi.ts`
   1. La définition zod est inconnue de l'API. Ainsi il est nécessaire d'utiliser `zodOpenApi.unknown()`.
   2. Veuiller référencer le model zod pour la bonne exécution des tests `zodOpenApi.unknown().openapi(<nom>)`
3. Exporter ce fichier dans `sdk/src/models/internal.ts`
4. Référencer le model dans la variable `openapiSpec` du fichier `sdk/src/openapi/openapiSpec.ts`
5. Vérifier que la documentation technique est correcte en lançant les tests `yarn typecheck && yarn test sdk/src/openapi`
6. Mettez à jour le snapshot `openapi` en lançant les tests `yarn typecheck && yarn test shared/src/openapi`

#### Création de la documentation technique des routes

1. Générer le schema openapi et la doc technique à partir de la specification de l'API externe
   1. Copier le contenu de type `OperationObject` depuis la doc openapi de l'API externe dans un fichier `./tmp/source.json`
   2. Lancer le build `yarn typecheck && yarn build:dev`
   3. Lancer la commande `yarn cli dev:doc:init:external:route ./tmp/source.json ./tmp/out.route.doc.json ./tmp/out.route.openapi.json`
   4. La command génère 2 fichiers:
      1. `./tmp/out.route.doc.json`: Contient la documentation technique de la route (à copier dans le fichier `sdk/src/docs/routes/<nom>/<nom>.route.doc.ts`)
      2. `./tmp/out.route.openapi.json`: Contient la définition de la route openapi (à utiliser pour la propriété `schema` de la route dans le fichier `sdk/src/routes/<nom>/<nom>.routes.openapi.ts`)
2. Si besoin, ajouter le tag dans le fichier `sdk/src/openapi/tags.openapi.ts`
3. Créer les spécifications des routes utilisés dans la spec openapi dans un fichier `sdk/src/routes/<nom>/<nom>.route.openapi.ts`
4. Exporter ce fichier dans `sdk/src/routes/internal.ts`
5. Référencer la route dans la variable `openapiSpec` du fichier `sdk/src/openapi/openapiSpec.ts`
6. Vérifier que la documentation technique est correcte en lançant les tests `yarn typecheck && yarn test sdk/src/openapi`

#### Modification de la documentation technique

Il est possible que certaines définitions générées ne soient pas correctes. Dans ce cas, il est possible de modifier les fichiers `sdk/src/docs/models/<nom>/<nom>.model.doc.ts` & `sdk/src/docs/routes/<nom>/<nom>.route.doc.ts` manuellement pour ajuster le modèle openapi (la documentation technique des champs est généré automatiquement par LBA, ainsi il y a certains points non géré correctement).

#### Validation de la documentation technique

Pour s'assurer que la documenatation technique est à jour avec l'API distante, nous avons mis en place un CRON job qui vérifie la cohérence de la documentation technique.

Ce controle est effectué par le fichier `server/src/services/documentation/checkDocumentationSync.ts` qui compare la documentation technique avec la documentation de l'API distante.

Étant donné que la documentation de l'API distante peut être modifié, il est possible de mettre à jour la documentation technique en utilisant le fichier `server/src/services/documentation/expectedDocumentationDelta.ts`.

1. Mettre à jour la variable `OPERATION_MAPPING` avec le mapping de la nouvelle route dans le fichier `server/src/services/documentation/checkDocumentationSync.ts`
2. Lancer la commande `yarn cli job:run -n doc:check_sync` pour vérifier la cohérence de la documentation technique.
3. En cas d'erreur de synchronisation, la commande va afficher 2 variables:
   1. `delta`: La liste des différences entre la delta attendu et la delta actuel
   2. `result`: La liste des differences entre la documentation technique et la documentation de l'API distante actuel.
4. Vous avez 2 possibilités pour corriger le problème:
   1. Mettre à jour la documentation technique en utilisant le fichier `server/src/services/documentation/expectedDocumentationDelta.ts` via la valeur `result`
   2. Mettre à jour la documentation technique pour qu'elle corresponde à la documentation de l'API distante via la valeur `delta`.

## Création d'une route native

**TODO**
