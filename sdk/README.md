# API Alternance SDK

Ce SDK est une bibliothèque NodeJs 22+ qui fournit un moyen simple d'interagir avec [l'API Alternance](https://api.apprentissage.beta.gouv.fr/).

## Pré-requis

- NodeJs 22+: nous utilisons l'api `fetch` en natif sur NodeKS 22+. Si vous avez besoin d'élargir le support de la librairie à des versions antérieures, veuillez nous contacter.
- Un jeton d'accès à l'API Alternance. Pour obtenir un jeton d'accès, veuillez [vous créer un compte][https://api.apprentissage.beta.gouv.fr/docs/](https://api.apprentissage.beta.gouv.fr/compte/profil).

## Installation

```bash
yarn add api-alternance-sdk
```

## Utilisation

```javascript
import { ApiClient } from "api-alternance-sdk";

const apiClient = new ApiClient({ key: "votre-cle-api" });
```

Le client API dispose des méthode `get`, `post`, `put` et `delete` pour effectuer des requêtes HTTP sur l'API Alternance; ces méthodes vous retourneront les objets JSON typés renvoyés par l'API Alternance.

Il existe également des modules spécifiques pour chaque ressource de l'API Alternance, qui permettent d'obtenir des objets parsés, notamment les dates. Il existe 2 modules `organisme` et `certification`.

### Module Organisme

Le module organisme fournit des méthodes pour interagir avec les endpoints liés aux organismes.

#### recherche

`recherche(querystring: { uai?: string, siret?: string }): Promise<IRechercheOrganismeResponse>`: Recherche des organismes en fonction de la chaîne de requête fournie. Si le filtre est vide `{}`, toutes les certifications seront retournées. L'utilisation de la valeur `null` pour les champs `cfd` ou `rncp` retournera les résultats pour les certifications ayant ces valeurs à `null`.

```javascript
const querystring = {
  name: "some-name",
};

apiClient.organisme
  .recherche(querystring)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.error(error);
  });
```

### Module Certification

Le module certification fournit des méthodes pour interagir avec les endpoints liés aux certifications.

#### index

`index(filter: FindFilter): Promise<ICertification[]>`: Récupère une liste de certifications en fonction du filtre fourni.

### Module Job

Le module job fournit des méthodes pour interagir avec les endpoints liés aux opportunitées d'emploi sur La bonne alternance.

#### search

`search(querystring: IJobSearchQuery): Promise<IJobSearchResponse>`: Recherche des opportunitées d'emplois en fonction de requête fournie.

```javascript
const querystring = {
  latitude: 48.84823,
  longitude: 2.397416,
  radius: 10,
  target_diploma_level: "3",
  romes: ["F1603", "F1602"],
  rncp: "RNCP37442",
};

apiClient.job
  .search(querystring)
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.error(error);
  });
```

### Gestion des erreurs

Les erreurs sont levées sous forme d'instances de `ApiError`. Vous pouvez les capturer et les gérer comme suit :

```javascript
apiClient.certification.index(filter).catch((error) => {
  if (error instanceof ApiError) {
    console.error("Erreur API:", error.message);
  } else {
    console.error("Erreur inattendue:", error);
  }
});
```
