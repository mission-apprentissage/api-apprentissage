"use client";
import { fr } from "@codegouvfr/react-dsfr";
import { Summary } from "@codegouvfr/react-dsfr/Summary";
import { Grid, Typography } from "@mui/material";
import type { FC } from "react";
import { useEffect } from "react";

import Section from "@/components/section/Section";

export const cguVersion = "v1.0";

const anchors = {
  ChampApplication: "champ-application",
  Objet: "objet",
  Definition: "definition",
  FonctionnaliteLieesAuxComptesDesUtilisateurs: "fonctionnalite-liees-aux-comptes-des-utilisateurs",
  Responsabilites: "responsabilites",
  MiseAjourDesConditionsUtilisation: "mise-a-jour-des-conditions-utilisation",
};

const summaryData = [
  {
    anchorName: "Article 1 - Champ d'application",
    anchorLink: "champ-application",
  },
  { anchorName: "Article 2 - Objet", anchorLink: "objet" },
  {
    anchorName: "Article 3 - Définitions",
    anchorLink: "definition",
  },
  {
    anchorName: "Article 4 - Fonctionnalités liées aux comptes des utilisateurs",
    anchorLink: "fonctionnalite-liees-aux-comptes-des-utilisateurs",
  },
  {
    anchorName: "Article 5 - Responsabilités",
    anchorLink: "responsabilites",
  },
  {
    anchorName: "Article 6 - Mise à jour des conditions générales d'utilisation",
    anchorLink: "mise-a-jour-des-conditions-utilisation",
  },
];

interface Props {
  onLoad?: () => void;
}

const Cgu: FC<Props> = ({ onLoad }) => {
  useEffect(() => {
    onLoad?.();
  }, [onLoad]);

  return (
    <Grid container spacing={8}>
      <Grid item xs={12} lg={3}>
        <Summary
          links={summaryData.map((item) => ({
            linkProps: {
              href: `#${item.anchorLink}`,
            },
            text: item.anchorName,
          }))}
        />
      </Grid>
      <Grid item xs={12} lg={9}>
        <Typography variant="h1" gutterBottom color={fr.colors.decisions.text.actionHigh.blueEcume.default}>
          Conditions générales d&apos;utilisation
        </Typography>
        <Typography>Dernière mise à jour le : 23 mars 2024 - {cguVersion} </Typography>
        <Typography>
          Les présentes conditions générales d’utilisation (dites “CGU”) fixent le cadre juridique de “API
          apprentissage” et définissent les conditions d’accès et d’utilisation des services par l’Utilisateur.
        </Typography>

        <Section id={anchors.ChampApplication}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Article 1 – Champ d'application
          </Typography>
          <Typography>
            Le présent document a pour objet d’encadrer l’utilisation de la Plateforme. <br />
            L’inscription sur la Plateforme peut entraîner l’application de conditions spécifiques, listées dans les
            présentes CGU. <br />
            L’inscription est gratuite et ouverte à tous.
          </Typography>
        </Section>
        <Section id={anchors.Objet}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Article 2 – Objet
          </Typography>
          <Typography>
            API Apprentissage est destiné notamment aux opérateurs publics et privés, aux organismes de formation, aux
            entreprises, chefs de projets, développeurs ou apprenants. <br />
            L’objectif est de simplifier l’accès à des données de l’apprentissage fiables et à jour grâce à un point
            d’entrée unique et documenté.
          </Typography>
        </Section>
        <Section id={anchors.Definition}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Article 3 – Définitions
          </Typography>
          <Typography>
            <strong>« Utilisateur »</strong> : désigne toute personne physique qui souhaite accéder aux données de
            l’apprentissage.
            <br />
            <br />
            <strong>« Services »</strong> : désigne les fonctionnalités offertes par la Plateforme pour répondre à ses
            finalités.
            <br />
            <br />
            <strong>« Plateforme »</strong> : désigne le service numérique API Apprentissage.
            <br />
            <br />
            <strong>« Éditeur »</strong> : désigne la Délégation générale à l’emploi et à la formation professionnelle
            (DGEFP).
          </Typography>
        </Section>
        <Section id={anchors.FonctionnaliteLieesAuxComptesDesUtilisateurs}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Article 4 – Fonctionnalités liées aux comptes des utilisateurs
          </Typography>
          <Typography>
            Chaque Utilisateur peut s’inscrire sur la Plateforme en renseignant son adresse e-mail.
            <br />
            Il reçoit un lien lui permettant de se connecter à son compte API apprentissage et de compléter ses
            informations personnelles.
            <br />
            Un code technique d’accès est créé à l’Utilisateur pour qu’il puisse profiter des Services.
            <br />
            La plateforme fournit à l’Utilisateur plusieurs points d’accès “techniques” permettant à partir d’une ou
            plusieurs informations (codes, dates etc…) de récupérer des données mises en forme et documentées.
          </Typography>
        </Section>
        <Section id={anchors.Responsabilites}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Article 5 – Responsabilités
          </Typography>
          <Typography variant="h3" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            5.1. L'éditeur de la Plateforme
          </Typography>
          <Typography>
            <br />
            Les sources des informations diffusées sur API Apprentissage sont réputées fiables mais la Plateforme ne
            garantit pas qu’elle soit exempte de défauts, d’erreurs ou d’omissions. <br />
            L’Éditeur s’engage à la sécurisation de la Plateforme, notamment en prenant toutes les mesures nécessaires
            permettant de garantir la sécurité et la confidentialité des informations fournies. <br />
            L’Éditeur fournit les moyens nécessaires et raisonnables pour assurer un accès continu à la Plateforme.
            <br />
            Il se réserve la liberté de faire évoluer, de modifier ou de suspendre, sans préavis, la Plateforme pour des
            raisons de maintenance ou pour tout autre motif jugé nécessaire.
            <br />
            Il se réserve notamment le droit de suspendre ou de bloquer l’accès à un compte d’un Utilisateur ne
            respectant pas les présentes conditions générales d’utilisation.
          </Typography>
          <br />
          <Typography variant="h3" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            5.2. L'utilisateur
          </Typography>
          <Typography>
            <br />
            L’Utilisateur s’assure de garder son jeton d’accès à l’API secret. Toute divulgation du jeton quelle que
            soit sa forme, est interdite. <br />
            Il assume les risques liés à l’utilisation de son adresse e-mail et jeton d’accès. <br />
            Il s’engage à ne pas commercialiser les données reçues et à ne pas les communiquer à des tiers en dehors des
            cas prévus par la loi. <br />
            Toute information transmise par l’Utilisateur est de sa seule responsabilité. <br />
            Il est rappelé que toute personne procédant à une fausse déclaration pour elle-même ou pour autrui s’expose
            notamment aux sanctions prévues à l’article 441-1 du code pénal, prévoyant des peines pouvant aller jusqu’à
            trois ans d’emprisonnement et 45 000 euros d’amende.
          </Typography>
        </Section>
        <Section id={anchors.MiseAjourDesConditionsUtilisation}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Article 6 – Mise à jour des conditions d'utilisation
          </Typography>
          <Typography>
            Les termes des présentes conditions générales d’utilisation peuvent être amendés à tout moment, en fonction
            des modifications apportées à la Plateforme, de l’évolution de la législation ou pour tout autre motif jugé
            nécessaire. Chaque modification donne lieu à une nouvelle version qui est acceptée par les parties.
          </Typography>
        </Section>
      </Grid>
    </Grid>
  );
};

export default Cgu;
