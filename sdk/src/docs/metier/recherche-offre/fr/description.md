**Accédez gratuitement et en temps réel à l'ensemble des opportunités d'emploi en alternance disponibles sur le territoire français.** Les opportunités d’emploi retournées sont celles collectées par [La bonne alternance](https://labonnealternance.apprentissage.beta.gouv.fr/) ainsi que [ses sites partenaires](https://mission-apprentissage.notion.site/Liste-des-partenaires-de-La-bonne-alternance-3e9aadb0170e41339bac486399ec4ac1?pvs=74).

**Trois types d’opportunités d’emploi** sont disponibles :

1. **offres_emploi_lba** : offres déposées directement via notre dépôt d’offres (25 000 offres en 2025).

1. **offres_emploi_partenaires** : offres issues de nos partenaires (France Travail, Météojobs), de flux directs avec des groupes comme Enedis ou Engie, ainsi que de multidiffuseurs tels que Talentplug, Veritone, et d’ATS comme Kelio ou Wink ([liste de nos partenaires](https://mission-apprentissage.notion.site/Liste-des-partenaires-de-La-bonne-alternance-3e9aadb0170e41339bac486399ec4ac1?pvs=74)). 325 000 offres diffusées en 2025.

1. **recruteurs_lba** : entreprises identifiées comme ayant un fort potentiel d’embauche mais n’ayant pas déposé d’offres ; nous suggérons aux candidats d’envoyer des candidatures spontanées. 400 000 entreprises en 2025.

**💡Quelques conseils pour vos intégrations :**

- Vous pouvez rechercher dans l’ensemble opportunités d’emploi selon les critères suivants : Code(s) ROME, RNCP, géolocalisation, niveau de diplôme et rayon de recherche.

- Pour les offres_emploi_lba : il est possible de distinguer les offres publiées directement par les entreprises de celles diffusées par les centres de formation qui recrutent pour le compte d’entreprises partenaires, grâce au champ « is_delegated ». Si ce champ est défini sur TRUE, l’offre provient d’un centre de formation.

- Pour les offres_emploi_partenaires : le champ « Partner Label » permet d’identifier les offres à sélectionner ou à exclure selon vos enjeux.

Les résultats sont retournés par priorité de source (La bonne alternance puis ses partenaires), par distance croissante au lieu de recherche si ce dernier a été fourni en paramètre et par date de création décroissante.

**📥Vous pouvez également télécharger l’ensemble de ces offres au format JSON en utilisant [cette route](/fr/documentation-technique#tag/Offre-Emploi/operation/jobsExport).**

L'utilisation de cette API est gratuite et réservée à des usages non lucratifs. Notez que toute utilisation de ces données à des fins commerciales, telles que la revente ou la facturation de l'accès pour des tiers comme des candidats est interdite.
