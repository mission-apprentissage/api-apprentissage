# Modifier la documentation

Le but de ce guide est d'expliquer comment modifier les contenus textuels de la documentation des APIs.

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

## Modifier le contenu

Pour modifier le contenu de la documentation, il suffit de modifier les fichiers `.doc.ts` ou `.md` dans le dossier `sdk/src/docs/`. Dans le cas ou vous souhaitez ajouter un document markdown, il est possible de le faire en créant un fichier `.md` dans le dossier `sdk/src/docs/` et d'ensuite importer le fichier `.ts` correspondant tel que:

```typescript
import myMarkdown from "./my-markdown.md.ts";
```

## Proposer les modifications

Sur github il est possible de proposer des modifications de la documentation en créant une pull request. Pour cela, il suffit de créer une branche à partir de la branche `main`, de faire les modifications et de créer une pull request.
