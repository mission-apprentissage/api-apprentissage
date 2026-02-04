# Documentation des Jobs

Ce document décrit tous les jobs d'import et de traitement de données de l'API Apprentissage.

## Sommaire

### Jobs d'import de sources

- [import:bcn](#importbcn) - Import des données BCN (Base Centrale des Nomenclatures)
- [import:acce](#importacce) - Import des données ACCE (établissements éducatifs)
- [import:kit_apprentissage](#importkit_apprentissage) - Import des correspondances CFD/RNCP
- [import:referentiel](#importreferentiel) - Import des organismes depuis le Référentiel ONISEP
- [import:catalogue](#importcatalogue) - Import du catalogue des formations en apprentissage
- [import:france_competence](#importfrance_competence) - Import des certifications RNCP/RS
- [import:communes](#importcommunes) - Import des communes françaises
- [import:mission_locale](#importmission_locale) - Import des missions locales
- [import:kali_ccn](#importkali_ccn) - Import des conventions collectives (KALI)
- [import:dares_ccn](#importdares_ccn) - Import des conventions collectives (DARES)
- [import:dares_cape_idcc](#importdares_cape_idcc) - Import des correspondances APE/IDCC
- [import:npec](#importnpec) - Import des niveaux de prise en charge

### Jobs de calcul/agrégation

- [import:certifications](#importcertifications) - Agrégation des certifications
- [import:organismes](#importorganismes) - Agrégation des organismes de formation
- [import:formation](#importformation) - Agrégation des formations

### Jobs d'indicateurs et maintenance

- [indicateurs:source_kit_apprentissage:update](#indicateurssource_kit_apprentissageupdate) - Mise à jour des indicateurs Kit Apprentissage
- [doc:check_sync](#doccheck_sync) - Vérification de la synchronisation de la documentation

### Tâches planifiées (Crons)

- [Notification expiration clés API](#notification-expiration-clés-api)
- [Suppression des comptes inactifs](#suppression-des-comptes-inactifs)

---

## Jobs d'import de sources

### import:bcn

#### Description

Importe les données de la BCN (Base Centrale des Nomenclatures) maintenue par la DEPP (Direction de l'évaluation, de la prospective et de la performance) du Ministère de l'Éducation nationale. Ces données constituent le référentiel officiel des diplômes et formations en France, identifiés par leur code CFD (Code Formation Diplôme).

#### Source de données

| Propriété   | Valeur                                                   |
| ----------- | -------------------------------------------------------- |
| **Source**  | BCN - Base Centrale des Nomenclatures (DEPP)             |
| **URL**     | `https://bcn.depp.education.fr/bcn/index.php/export/CSV` |
| **Méthode** | POST                                                     |
| **Format**  | CSV (encodage Latin-1, délimiteur `;`)                   |

**Tables importées :**

| Table                            | Description                                                                              |
| -------------------------------- | ---------------------------------------------------------------------------------------- |
| `N_FORMATION_DIPLOME`            | Table principale des diplômes avec les données de continuité (anciens/nouveaux diplômes) |
| `N_FORMATION_DIPLOME_ENQUETE_51` | Données spécifiques aux enquêtes sur les diplômes                                        |
| `N_NIVEAU_FORMATION_DIPLOME`     | Niveaux de formation des diplômes                                                        |
| `V_FORMATION_DIPLOME`            | Vue de base des formations diplômantes                                                   |

#### Collection de destination

| Collection   | Description                             |
| ------------ | --------------------------------------- |
| `source.bcn` | Stocke toutes les données BCN importées |

#### Étapes du job

1. **Initialisation** : Création d'un enregistrement dans `import.meta` avec le statut "pending"
2. **Import des 4 sources** : Pour chaque table BCN :
   - Récupération des données CSV via l'API BCN
   - Parsing et transformation des données (conversion des `.` en `_` dans les noms de colonnes)
   - Extraction des tableaux `ANCIEN_DIPLOMES` et `NOUVEAU_DIPLOMES` pour `N_FORMATION_DIPLOME`
   - Validation des enregistrements via des schémas Zod
   - Insertion en base par lots de 100 enregistrements
   - Suppression des anciennes données
3. **Calcul de l'indicateur de continuité** : Analyse des relations entre anciens et nouveaux diplômes
4. **Finalisation** : Mise à jour du statut à "done" et déclenchement du job `indicateurs:source_kit_apprentissage:update`

#### Pré-requis

**Aucun** - Ce job peut s'exécuter de manière indépendante.

#### Jobs dépendants

| Job                                           | Description                                                |
| --------------------------------------------- | ---------------------------------------------------------- |
| `indicateurs:source_kit_apprentissage:update` | Déclenché automatiquement après l'import                   |
| `import:certifications`                       | Utilise les données BCN pour construire les certifications |

#### Planification

- **Cron** : `0 */4 * * *` (toutes les 4 heures)
- **Durée max** : 30 minutes

---

### import:acce

#### Description

Importe les données des établissements éducatifs depuis l'ACCE (Annuaire Central des Établissements) maintenu par la DEPP. Ces données contiennent les informations sur les établissements identifiés par leur UAI (Unité Administrative Immatriculée).

#### Source de données

| Propriété            | Valeur                                                          |
| -------------------- | --------------------------------------------------------------- |
| **Source**           | ACCE - Annuaire Central des Établissements                      |
| **URL**              | `https://acce.depp.education.fr/acce`                           |
| **Authentification** | Formulaire (username/password)                                  |
| **Format**           | ZIP contenant 5 fichiers CSV (encodage Latin-1, délimiteur `;`) |

**Fichiers importés :**

| Fichier              | Description                                        |
| -------------------- | -------------------------------------------------- |
| `ACCE_UAI.csv`       | Données principales des établissements (88 champs) |
| `ACCE_UAI_ZONE.csv`  | Affectations zones/districts                       |
| `ACCE_UAI_SPEC.csv`  | Spécialités des établissements                     |
| `ACCE_UAI_MERE.csv`  | Relations établissements parents                   |
| `ACCE_UAI_FILLE.csv` | Relations établissements enfants                   |

#### Collection de destination

| Collection    | Description                              |
| ------------- | ---------------------------------------- |
| `source.acce` | Stocke toutes les données ACCE importées |

#### Étapes du job

1. **Authentification** : Connexion au portail ACCE avec les identifiants
2. **Extraction** : Demande d'extraction et téléchargement du fichier ZIP
3. **Parsing** : Pour chaque fichier CSV dans le ZIP :
   - Parsing avec délimiteur `;` et encodage Latin-1
   - Validation des données via schémas Zod
   - Insertion par lots de 100
4. **Nettoyage** : Suppression des données des imports précédents
5. **Finalisation** : Mise à jour du statut dans `import.meta`

#### Pré-requis

| Pré-requis          | Description                                  |
| ------------------- | -------------------------------------------- |
| `API_ACCE_USERNAME` | Variable d'environnement - Identifiant ACCE  |
| `API_ACCE_PASSWORD` | Variable d'environnement - Mot de passe ACCE |

#### Planification

- **Cron** : `0 4 * * *` (tous les jours à 4h)
- **Durée max** : 30 minutes

---

### import:kit_apprentissage

#### Description

Importe les correspondances entre les codes CFD (Code Formation Diplôme) et les codes RNCP (Répertoire National des Certifications Professionnelles). Ces données proviennent du Kit Apprentissage maintenu par InterCARIF/OREF.

#### Source de données

| Propriété            | Valeur                                                               |
| -------------------- | -------------------------------------------------------------------- |
| **Source**           | Kit Apprentissage (InterCARIF/OREF)                                  |
| **URL API**          | `https://api-kit-apprentissage.intercariforef.org/cfd_rncp_intitule` |
| **Authentification** | Token (`token-connexion` header)                                     |
| **Format**           | JSON paginé                                                          |

**Sources additionnelles :**

- Fichiers historiques CSV/XLSX dans `server/static/kit_apprentissage/`

#### Collection de destination

| Collection                 | Description              |
| -------------------------- | ------------------------ |
| `source.kit_apprentissage` | Correspondances CFD/RNCP |

#### Étapes du job

1. **Import historique** : Traitement des fichiers CSV/XLSX locaux (données avant 2024-06-30)
2. **Import API** : Récupération des données courantes via l'API paginée
3. **Transformation** : Nettoyage des codes CFD (padding à 8 chiffres, filtrage des valeurs invalides)
4. **Insertion** : Upsert par lots de 100 sur la clé (cfd, rncp)
5. **Déclenchement** : Lancement du job `indicateurs:source_kit_apprentissage:update`

#### Pré-requis

| Pré-requis                    | Description                                             |
| ----------------------------- | ------------------------------------------------------- |
| `API_KIT_APPRENTISSAGE_TOKEN` | Variable d'environnement - Token d'authentification API |

#### Jobs dépendants

| Job                                           | Description                          |
| --------------------------------------------- | ------------------------------------ |
| `indicateurs:source_kit_apprentissage:update` | Déclenché automatiquement            |
| `import:certifications`                       | Utilise les correspondances CFD/RNCP |

#### Planification

- **Cron** : `0 */4 * * *` (toutes les 4 heures)
- **Durée max** : 30 minutes

---

### import:referentiel

#### Description

Importe les données des organismes de formation depuis le Référentiel Apprentissage maintenu par l'ONISEP. Ces données servent de source principale pour construire la collection des organismes.

#### Source de données

| Propriété         | Valeur                                                               |
| ----------------- | -------------------------------------------------------------------- |
| **Source**        | Référentiel Apprentissage ONISEP                                     |
| **URL**           | `https://referentiel.apprentissage.onisep.fr/api/v1/organismes.json` |
| **Format**        | JSON                                                                 |
| **Documentation** | https://referentiel.apprentissage.onisep.fr/api/v1/doc/              |

#### Collection de destination

| Collection           | Description                   |
| -------------------- | ----------------------------- |
| `source.referentiel` | Données brutes des organismes |

#### Étapes du job

1. **Récupération** : Appel API avec pagination (60 000 items max)
2. **Validation** : Vérification de la structure de réponse
3. **Insertion** : Stockage des documents avec date d'import
4. **Nettoyage** : Suppression des données des imports précédents

#### Pré-requis

**Aucun** - Ce job peut s'exécuter de manière indépendante.

#### Jobs dépendants

| Job                 | Description                                                |
| ------------------- | ---------------------------------------------------------- |
| `import:organismes` | Utilise les données du référentiel comme source principale |

#### Planification

- **Cron** : `0 */4 * * *` (toutes les 4 heures)
- **Durée max** : 30 minutes

---

### import:catalogue

#### Description

Importe les données du Catalogue des formations en apprentissage maintenu par le réseau Carif-Oref. Ce catalogue contient toutes les formations publiées et leurs caractéristiques.

#### Source de données

| Propriété  | Valeur                                                                             |
| ---------- | ---------------------------------------------------------------------------------- |
| **Source** | Catalogue Apprentissage (Carif-Oref)                                               |
| **URL**    | `https://catalogue-apprentissage.intercariforef.org/api/v1/entity/formations.json` |
| **Format** | ZIP contenant des JSON Lines                                                       |

#### Collection de destination

| Collection         | Description                                |
| ------------------ | ------------------------------------------ |
| `source.catalogue` | Données brutes des formations du catalogue |

#### Étapes du job

1. **Comptage** : Récupération du nombre total de formations publiées
2. **Téléchargement** : Stream du fichier ZIP
3. **Filtrage** : Exclusion des formations jamais publiées (`tags.length === 0`)
4. **Insertion** : Insertion par lots de 100
5. **Nettoyage** : Suppression des anciennes données

#### Pré-requis

**Aucun** - Ce job peut s'exécuter de manière indépendante.

#### Jobs dépendants

| Job                | Description                                                     |
| ------------------ | --------------------------------------------------------------- |
| `import:formation` | Utilise les données du catalogue pour construire les formations |

#### Planification

- **Cron** : `0 */4 * * *` (toutes les 4 heures)
- **Durée max** : 30 minutes

---

### import:france_competence

#### Description

Importe les données des certifications professionnelles (RNCP et RS) depuis France Compétences via data.gouv.fr. Ces données constituent le référentiel officiel des certifications professionnelles en France.

#### Source de données

| Propriété      | Valeur                                                             |
| -------------- | ------------------------------------------------------------------ |
| **Source**     | France Compétences (via data.gouv.fr)                              |
| **Dataset ID** | `5eebbc067a14b6fecc9c9976`                                         |
| **URL API**    | `https://www.data.gouv.fr/api/1/datasets/5eebbc067a14b6fecc9c9976` |
| **Format**     | ZIP contenant 10 fichiers CSV                                      |

**Fichiers CSV importés :**

| Fichier                                                   | Description                            |
| --------------------------------------------------------- | -------------------------------------- |
| `export_fiches_CSV_Standard_*.csv`                        | Données principales des certifications |
| `export_fiches_CSV_Blocs_De_Compétences_*.csv`            | Blocs de compétences                   |
| `export_fiches_CSV_CCN_*.csv`                             | Conventions collectives associées      |
| `export_fiches_CSV_Partenaires_*.csv`                     | Organismes partenaires                 |
| `export_fiches_CSV_Nsf_*.csv`                             | Codes NSF                              |
| `export_fiches_CSV_Formacode_*.csv`                       | Codes Formacode                        |
| `export_fiches_CSV_Ancienne_Nouvelle_Certification_*.csv` | Continuité des certifications          |
| `export_fiches_CSV_VoixdAccès_*.csv`                      | Voies d'accès                          |
| `export_fiches_CSV_Rome_*.csv`                            | Codes ROME                             |
| `export_fiches_CSV_Certificateurs_*.csv`                  | Organismes certificateurs              |

#### Collection de destination

| Collection                 | Description                                  |
| -------------------------- | -------------------------------------------- |
| `source.france_competence` | Données complètes des certifications RNCP/RS |

#### Étapes du job

1. **Orchestration** (`import:france_competence`) :
   - Récupération des métadonnées du dataset
   - Identification des nouvelles ressources à traiter
   - Création d'un sous-job par ressource
2. **Traitement ressource** (`import:france_competence:resource`) :
   - Téléchargement de l'archive ZIP
   - Parsing des 10 fichiers CSV
   - Insertion par lots de 500
   - Construction de la carte de continuité
3. **Déclenchement** : Lancement du job `indicateurs:source_kit_apprentissage:update`

#### Pré-requis

**Aucun** - Ce job peut s'exécuter de manière indépendante.

#### Jobs dépendants

| Job                                           | Description                            |
| --------------------------------------------- | -------------------------------------- |
| `indicateurs:source_kit_apprentissage:update` | Déclenché automatiquement              |
| `import:certifications`                       | Utilise les données France Compétences |

#### Planification

- **Cron** : `0 4 * * *` (tous les jours à 4h)
- **Durée max** : 30 minutes

---

### import:communes

#### Description

Importe les données des communes françaises depuis plusieurs API gouvernementales. Ces données fournissent le contexte géographique et administratif pour les autres collections.

#### Source de données

| Source                         | URL                                              | Description                                                    |
| ------------------------------ | ------------------------------------------------ | -------------------------------------------------------------- |
| **API Géo**                    | `https://geo.api.gouv.fr`                        | Régions, départements, communes                                |
| **API INSEE**                  | `https://api.insee.fr`                           | Collectivités d'outre-mer, arrondissements, anciennes communes |
| **API Enseignement Supérieur** | `https://data.enseignementsup-recherche.gouv.fr` | Académies par département                                      |

#### Collection de destination

| Collection | Description                         |
| ---------- | ----------------------------------- |
| `commune`  | Référentiel des communes françaises |

#### Étapes du job

1. **Récupération parallèle** :
   - Régions depuis l'API Géo
   - Collectivités d'outre-mer depuis INSEE
   - Académies depuis l'API Enseignement Supérieur
   - Arrondissements municipaux depuis INSEE
   - Anciennes communes depuis INSEE
2. **Traitement par région** :
   - Pour chaque région, récupération des départements
   - Pour chaque département, récupération des communes
   - Enrichissement avec académie et mission locale
3. **Insertion** : Upsert par code INSEE
4. **Nettoyage** : Suppression des communes non mises à jour

#### Pré-requis

| Pré-requis              | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| `API_INSEE_TOKEN`       | Variable d'environnement - Token d'authentification INSEE |
| `import:mission_locale` | Doit avoir été exécuté pour lier les missions locales     |

#### Jobs dépendants

| Job                 | Description                                             |
| ------------------- | ------------------------------------------------------- |
| `import:organismes` | Utilise les communes pour l'enrichissement géographique |
| `import:formation`  | Utilise les communes pour les lieux de formation        |

#### Planification

- **Cron** : `0 4 * * *` (tous les jours à 4h)
- **Durée max** : 30 minutes

---

### import:mission_locale

#### Description

Importe les correspondances entre les codes INSEE des communes et les missions locales depuis l'UNML (Union Nationale des Missions Locales).

#### Source de données

| Propriété             | Valeur                                                               |
| --------------------- | -------------------------------------------------------------------- |
| **Source principale** | Fichier CSV statique des zones de couverture                         |
| **Fichier**           | `server/static/mission_locales/zones_de_couverture_janvier_2026.csv` |
| **API UNML**          | `https://api.unml.info/TrouveTaML/`                                  |
| **Format CSV**        | Délimiteur `;`, encodage UTF-8 avec BOM                              |

#### Collection de destination

| Collection           | Description                            |
| -------------------- | -------------------------------------- |
| `source.insee_to_ml` | Correspondances INSEE → Mission Locale |

#### Étapes du job

1. **Lecture CSV** : Parsing du fichier de zones de couverture
2. **Enrichissement** : Pour chaque mission locale unique, appel à l'API UNML pour récupérer les détails (adresse, coordonnées, contact)
3. **Insertion** : Upsert par lots de 500 sur le code INSEE
4. **Nettoyage** : Suppression des anciennes correspondances

#### Pré-requis

**Aucun** - Ce job peut s'exécuter de manière indépendante.

#### Jobs dépendants

| Job               | Description                                    |
| ----------------- | ---------------------------------------------- |
| `import:communes` | Utilise les données pour enrichir les communes |

#### Planification

- **Cron** : `0 4 * * *` (tous les jours à 4h)
- **Durée max** : 30 minutes

---

### import:kali_ccn

#### Description

Importe les conventions collectives nationales depuis la base KALI via data.gouv.fr. KALI est la base officielle des conventions collectives maintenue par la DILA (Direction de l'Information Légale et Administrative).

#### Source de données

| Propriété       | Valeur                                                                        |
| --------------- | ----------------------------------------------------------------------------- |
| **Source**      | KALI - Conventions collectives nationales                                     |
| **Dataset ID**  | `53ba5033a3a729219b7bead9`                                                    |
| **Resource ID** | `02b67492-5243-44e8-8dd1-0cb3f90f35ff`                                        |
| **URL**         | `https://www.data.gouv.fr/fr/datasets/r/02b67492-5243-44e8-8dd1-0cb3f90f35ff` |
| **Format**      | Excel (.xlsx)                                                                 |

#### Collection de destination

| Collection        | Description                  |
| ----------------- | ---------------------------- |
| `source.kali.ccn` | Conventions collectives KALI |

#### Étapes du job

1. **Récupération métadonnées** : Appel API data.gouv.fr pour le dataset
2. **Téléchargement** : Téléchargement du fichier Excel
3. **Parsing** : Extraction des données de la feuille "Feuil1" (à partir de la ligne 4)
4. **Transformation** : Normalisation des valeurs enum (suppression des diacritiques, majuscules)
5. **Insertion** : Insertion par lots de 500
6. **Nettoyage** : Suppression des données des imports précédents

#### Pré-requis

**Aucun** - Ce job peut s'exécuter de manière indépendante.

#### Planification

- **Cron** : `0 4 * * *` (tous les jours à 4h)
- **Durée max** : 30 minutes

---

### import:dares_ccn

#### Description

Importe la liste des conventions collectives et leurs codes IDCC depuis le site du Ministère du Travail (DARES).

#### Source de données

| Propriété  | Valeur                                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------------------------- |
| **Source** | DARES - Ministère du Travail                                                                                          |
| **URL**    | `https://travail-emploi.gouv.fr/dialogue-social/negociation-collective/article/conventions-collectives-nomenclatures` |
| **Format** | Excel (.xlsx) téléchargé via scraping                                                                                 |

#### Collection de destination

| Collection         | Description                   |
| ------------------ | ----------------------------- |
| `source.dares.ccn` | Conventions collectives DARES |

#### Étapes du job

1. **Scraping** : Récupération de l'URL du fichier Excel sur la page du Ministère
2. **Vérification** : Comparaison avec les imports précédents (URL et date)
3. **Téléchargement** : Téléchargement du fichier Excel
4. **Parsing** : Extraction des colonnes IDCC et TITRE depuis la feuille "Liste IDCC-Publication"
5. **Insertion** : Insertion par lots de 500
6. **Mise à jour** : Mise à jour du statut dans `import.meta`

#### Pré-requis

**Aucun** - Ce job peut s'exécuter de manière indépendante.

#### Planification

- **Cron** : `0 4 * * *` (tous les jours à 4h)
- **Durée max** : 30 minutes

---

### import:dares_cape_idcc

#### Description

Importe la table de correspondance entre les codes APE (activité économique) et les codes IDCC (conventions collectives) depuis le site DARES.

> **Note** : Ce job est actuellement **désactivé** dans la configuration des crons.

#### Source de données

| Propriété  | Valeur                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| **Source** | DARES - Ministère du Travail                                                                           |
| **URL**    | `https://dares.travail-emploi.gouv.fr/donnees/les-portraits-statistiques-de-branches-professionnelles` |
| **Format** | Excel (.xlsx) téléchargé via scraping                                                                  |

#### Collection de destination

| Collection              | Description              |
| ----------------------- | ------------------------ |
| `source.dares.ape_idcc` | Correspondances APE/IDCC |

#### Étapes du job

1. **Scraping** : Recherche du lien de téléchargement sur la page DARES
2. **Téléchargement** : Récupération du fichier Excel
3. **Parsing** : Extraction des colonnes (APE, intitulé, effectif, IDCC, titre, pourcentage)
4. **Insertion** : Insertion par lots de 500

#### Pré-requis

**Aucun** - Ce job peut s'exécuter de manière indépendante.

#### Planification

- **Statut** : Désactivé (commenté dans la configuration)
- **Cron prévu** : `0 4 * * *` (tous les jours à 4h)

---

### import:npec

#### Description

Importe les niveaux de prise en charge (NPEC) des contrats d'apprentissage depuis France Compétences. Ces données définissent les montants de financement par certification et par branche professionnelle.

#### Source de données

| Propriété  | Valeur                                                              |
| ---------- | ------------------------------------------------------------------- |
| **Source** | France Compétences                                                  |
| **URL**    | `https://www.francecompetences.fr/referentiels-et-bases-de-donnees` |
| **Format** | Excel (.xlsx) ou ZIP contenant des Excel                            |

#### Collections de destination

| Collection               | Description                                       |
| ------------------------ | ------------------------------------------------- |
| `source.npec`            | Données brutes NPEC et correspondances CPNE-IDCC  |
| `source.npec.normalized` | Données NPEC normalisées (à partir de 2022-07-01) |

#### Étapes du job

1. **Orchestration** (`import:npec`) :
   - Scraping de la page France Compétences pour trouver les fichiers disponibles
   - Comparaison avec les imports existants
   - Création d'un sous-job par fichier à traiter
2. **Traitement fichier** (`import:npec:resource`) :
   - Téléchargement (XLSX direct ou ZIP)
   - Parsing avec gestion de ~10 formats historiques différents
   - Extraction des données NPEC et des correspondances CPNE-IDCC
   - Insertion par lots de 500
3. **Normalisation** : Pour les fichiers à partir de 2022-07-01, normalisation des codes RNCP et des dates

#### Pré-requis

**Aucun** - Ce job peut s'exécuter de manière indépendante.

#### Planification

- **Statut** : Exécution manuelle uniquement (pas de cron configuré)

---

## Jobs de calcul/agrégation

### import:certifications

#### Description

Agrège les données de certification en combinant les informations de BCN, Kit Apprentissage et France Compétences. Ce job crée une vue unifiée des certifications avec leurs correspondances CFD/RNCP, périodes de validité et relations de continuité.

#### Sources de données internes

| Collection source          | Job d'alimentation         | Description                |
| -------------------------- | -------------------------- | -------------------------- |
| `source.bcn`               | `import:bcn`               | Données des diplômes (CFD) |
| `source.kit_apprentissage` | `import:kit_apprentissage` | Correspondances CFD/RNCP   |
| `source.france_competence` | `import:france_competence` | Données RNCP complètes     |

#### Collection de destination

| Collection       | Description                                         |
| ---------------- | --------------------------------------------------- |
| `certifications` | Certifications agrégées avec toutes les métadonnées |

#### Étapes du job

1. **Vérification des pré-requis** : Validation que les 3 sources sont à jour
2. **Validation qualité** : Vérification des règles de cohérence BCN
3. **Import depuis BCN** : Agrégation des certifications à partir des CFD
4. **Import depuis France Compétences** : Agrégation des certifications éligibles à l'apprentissage
5. **Traitement de la couverture** : Création de certifications pour couvrir toutes les périodes de validité
6. **Traitement de la continuité** : Liaison des anciennes et nouvelles certifications
7. **Statistiques** : Calcul des métriques (total, créées, orphelines)
8. **Nettoyage** : Suppression des certifications obsolètes

#### Pré-requis

| Job pré-requis             | Description                   |
| -------------------------- | ----------------------------- |
| `import:bcn`               | Doit être terminé avec succès |
| `import:kit_apprentissage` | Doit être terminé avec succès |
| `import:france_competence` | Doit être terminé avec succès |

#### Jobs dépendants

| Job                | Description                                             |
| ------------------ | ------------------------------------------------------- |
| `import:formation` | Utilise les certifications pour enrichir les formations |

#### Planification

- **Cron** : `0 1,5,9,13,17,21 * * *` (toutes les 4 heures, décalé)
- **Durée max** : 30 minutes

---

### import:organismes

#### Description

Agrège les données des organismes de formation en combinant les informations du Référentiel ONISEP avec les données entreprise (INSEE/SIRENE) et géographiques.

#### Sources de données internes

| Collection source    | Job d'alimentation   | Description                   |
| -------------------- | -------------------- | ----------------------------- |
| `source.referentiel` | `import:referentiel` | Données brutes des organismes |
| `commune`            | `import:communes`    | Contexte géographique         |

#### Sources de données externes

| Source             | URL                                 | Description                       |
| ------------------ | ----------------------------------- | --------------------------------- |
| **API Entreprise** | `https://entreprise.api.gouv.fr/v3` | Données SIRENE des établissements |
| **API Adresse**    | `https://api-adresse.data.gouv.fr`  | Géocodage des adresses            |

#### Collection de destination

| Collection  | Description                      |
| ----------- | -------------------------------- |
| `organisme` | Organismes de formation enrichis |

#### Étapes du job

1. **Vérification des pré-requis** : Validation que referentiel et communes sont à jour
2. **Import depuis le référentiel** :
   - Récupération des données enrichies (entreprise, adresse, commune)
   - Construction du profil complet de l'organisme
   - Upsert sur SIRET+UAI
3. **Mise à jour des historiques** : Mise à jour des organismes supprimés du référentiel
4. **Finalisation** : Mise à jour du statut

#### Pré-requis

| Job pré-requis       | Description                   |
| -------------------- | ----------------------------- |
| `import:referentiel` | Doit être terminé avec succès |
| `import:communes`    | Doit être terminé avec succès |

#### Jobs dépendants

| Job                | Description                                         |
| ------------------ | --------------------------------------------------- |
| `import:formation` | Utilise les organismes pour enrichir les formations |

#### Planification

- **Cron** : `0 1,5,9,13,17,21 * * *` (toutes les 4 heures, décalé)
- **Durée max** : 30 minutes

---

### import:formation

#### Description

Agrège les données de formation en combinant les informations du Catalogue avec les certifications, organismes et données géographiques.

#### Sources de données internes

| Collection source  | Job d'alimentation      | Description                   |
| ------------------ | ----------------------- | ----------------------------- |
| `source.catalogue` | `import:catalogue`      | Données brutes des formations |
| `certifications`   | `import:certifications` | Informations de certification |
| `organisme`        | `import:organismes`     | Informations des organismes   |
| `commune`          | `import:communes`       | Contexte géographique         |

#### Collection de destination

| Collection  | Description                       |
| ----------- | --------------------------------- |
| `formation` | Formations enrichies et complètes |

#### Étapes du job

1. **Vérification des pré-requis** : Validation que toutes les sources sont à jour
2. **Traitement en streaming** :
   - Lecture des données du catalogue
   - Enrichissement avec certification (CFD, RNCP)
   - Enrichissement avec organismes (formateur, responsable)
   - Enrichissement géographique (commune, département, région, académie)
   - Construction des sessions et modalités
3. **Insertion** : Upsert par lots de 100 sur `cle_ministere_educatif`
4. **Archivage** : Marquage des formations non mises à jour comme "archivé"

#### Pré-requis

| Job pré-requis          | Description                   |
| ----------------------- | ----------------------------- |
| `import:catalogue`      | Doit être terminé avec succès |
| `import:certifications` | Doit être terminé avec succès |
| `import:organismes`     | Doit être terminé avec succès |
| `import:communes`       | Doit être terminé avec succès |

#### Planification

- **Cron** : `0 2,6,10,14,18,22 * * *` (toutes les 4 heures, après les jobs de calcul step 1)
- **Durée max** : 30 minutes

---

## Jobs d'indicateurs et maintenance

### indicateurs:source_kit_apprentissage:update

#### Description

Calcule et met à jour les indicateurs de qualité des données Kit Apprentissage. Ce job identifie les codes CFD et RNCP présents dans Kit Apprentissage mais absents des référentiels BCN et France Compétences.

#### Sources de données internes

| Collection source          | Description                         |
| -------------------------- | ----------------------------------- |
| `source.kit_apprentissage` | Correspondances CFD/RNCP à vérifier |
| `source.bcn`               | Référentiel CFD pour validation     |
| `source.france_competence` | Référentiel RNCP pour validation    |

#### Collection de destination

| Collection                             | Description                       |
| -------------------------------------- | --------------------------------- |
| `indicateurs.source_kit_apprentissage` | Indicateurs quotidiens de qualité |

#### Étapes du job

1. **Calcul CFD manquants** : Comptage des CFD du Kit absents de BCN
2. **Calcul RNCP manquants** : Comptage des RNCP du Kit absents de France Compétences
3. **Enregistrement** : Upsert de l'indicateur du jour

#### Déclencheurs

Ce job est déclenché automatiquement par :

- `import:bcn`
- `import:kit_apprentissage`
- `import:france_competence`

#### Planification

- **Exécution** : Automatique après les jobs d'import associés

---

### doc:check_sync

#### Description

Vérifie que la documentation de l'API Alternance est synchronisée avec la documentation de La Bonne Alternance (LBA) pour les endpoints partagés.

#### Étapes du job

1. **Récupération LBA** : Fetch de la spec OpenAPI de LBA
2. **Construction API** : Génération de la spec OpenAPI locale
3. **Dé-référencement** : Résolution des $ref dans les deux specs
4. **Extraction** : Sélection des opérations mappées entre les deux APIs
5. **Comparaison** : Diff des structures d'opérations
6. **Validation** : Comparaison avec le delta attendu

#### Opérations comparées

| API Alternance                                   | LBA                                         |
| ------------------------------------------------ | ------------------------------------------- |
| `GET /job/v1/search`                             | `GET /v3/jobs/search`                       |
| `POST /job/v1/offer`                             | `POST /v3/jobs`                             |
| `PUT /job/v1/offer/{id}`                         | `PUT /v3/jobs/{id}`                         |
| `POST /job/v1/apply`                             | `POST /v2/application`                      |
| `GET /job/v1/offer/{id}/publishing-informations` | `GET /v3/jobs/{id}/publishing-informations` |
| `GET /job/v1/export`                             | `GET /v3/jobs/export`                       |
| `POST /formation/v1/appointment/generate-link`   | `POST /v2/appointment`                      |

#### Planification

- **Cron** : `0 0 * * *` (tous les jours à minuit)

---

## Tâches planifiées (Crons)

### Notification expiration clés API

#### Description

Envoie des notifications par email aux utilisateurs dont les clés API arrivent à expiration.

#### Étapes

1. **Recherche** : Identification des utilisateurs avec des clés expirant dans les 30 prochains jours
2. **Notification 30 jours** : Envoi d'un email d'avertissement à J-30
3. **Notification 15 jours** : Envoi d'un email de rappel à J-15
4. **Marquage** : Enregistrement des notifications envoyées pour éviter les doublons

#### Planification

- **Cron** : `0 8 * * *` (tous les jours à 8h)

---

### Suppression des comptes inactifs

#### Description

Supprime automatiquement les comptes utilisateurs inactifs depuis plus de 2 ans.

#### Étapes

1. **Calcul** : Détermination de la date limite (aujourd'hui - 2 ans)
2. **Suppression** : Suppression de tous les utilisateurs avec `updated_at` antérieur à la limite

#### Planification

- **Cron** : `0 10 * * 1` (tous les lundis à 10h)

---

## Diagramme de dépendances

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SOURCES EXTERNES                                    │
└─────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                       JOBS D'IMPORT DE SOURCES                               │
│                                                                              │
│  ┌──────────────┐  ┌────────────────────┐  ┌─────────────────────┐          │
│  │ import:bcn   │  │ import:kit_apprent │  │ import:france_comp  │          │
│  └──────────────┘  └────────────────────┘  └─────────────────────┘          │
│         │                    │                       │                       │
│         └────────────────────┼───────────────────────┘                       │
│                              ▼                                               │
│                 ┌──────────────────────────┐                                 │
│                 │ import:certifications    │                                 │
│                 └──────────────────────────┘                                 │
│                              │                                               │
│  ┌─────────────────┐  ┌──────────────┐  ┌───────────────────┐               │
│  │ import:referent │  │ import:comm  │  │ import:mission_l  │               │
│  └─────────────────┘  └──────────────┘  └───────────────────┘               │
│         │                    │                    │                          │
│         └────────────────────┼────────────────────┘                          │
│                              ▼                                               │
│                 ┌──────────────────────────┐                                 │
│                 │ import:organismes        │                                 │
│                 └──────────────────────────┘                                 │
│                              │                                               │
│  ┌──────────────────┐        │                                               │
│  │ import:catalogue │────────┼                                               │
│  └──────────────────┘        │                                               │
│                              ▼                                               │
│                 ┌──────────────────────────┐                                 │
│                 │ import:formation         │                                 │
│                 └──────────────────────────┘                                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Planification des jobs

| Timing                    | Cron                      | Jobs                                                                   |
| ------------------------- | ------------------------- | ---------------------------------------------------------------------- |
| **import_source**         | `0 4 * * *`               | acce, france_competence, kali_ccn, dares_ccn, mission_locale, communes |
| **import_source_main**    | `0 */4 * * *`             | bcn, kit_apprentissage, referentiel, catalogue                         |
| **import_compute_step_1** | `0 1,5,9,13,17,21 * * *`  | certifications, organismes                                             |
| **import_compute_step_2** | `0 2,6,10,14,18,22 * * *` | formation                                                              |
