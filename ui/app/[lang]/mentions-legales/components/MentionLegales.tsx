import { fr } from "@codegouvfr/react-dsfr";
import { Summary } from "@codegouvfr/react-dsfr/Summary";
import { Grid, Typography } from "@mui/material";

import Section from "@/components/section/Section";
import { publicConfig } from "@/config.public";

export const mentionLegalesVersion = "v1.0";

const anchors = {
  DateMaj: "date-mise-a-jour",
  EditeurPlateforme: "editeur-plateforme",
  DirecteurDeLaPublication: "directeur-de-la-publication",
  HebergementPlateforme: "hebergement-plateforme",
  Accessibilite: "accessibilite",
  Securite: "securite",
};

const summaryData = [
  {
    anchorName: "Éditeur du site",
    anchorLink: anchors.EditeurPlateforme,
  },
  {
    anchorName: "Directeur de la publication",
    anchorLink: anchors.DirecteurDeLaPublication,
  },
  {
    anchorName: "Hébergement de la plateforme",
    anchorLink: anchors.HebergementPlateforme,
  },
  {
    anchorName: "Accessibilité",
    anchorLink: anchors.Accessibilite,
  },
  {
    anchorName: "Sécurité",
    anchorLink: anchors.Securite,
  },
];

const MentionsLegales = () => {
  return (
    <Grid container spacing={8}>
      <Grid
        size={{
          xs: 12,
          lg: 3,
        }}
      >
        <Summary
          links={summaryData.map((item) => ({
            linkProps: {
              href: `#${item.anchorLink}`,
            },
            text: item.anchorName,
          }))}
        />
      </Grid>
      <Grid
        size={{
          xs: 12,
          lg: 9,
        }}
      >
        <Typography variant="h1" gutterBottom color={fr.colors.decisions.text.actionHigh.blueEcume.default}>
          Mentions légales
        </Typography>

        <Typography>Mentions légales du site « {publicConfig.productMeta.brandName} »</Typography>
        <Typography>Dernière mise à jour le : 23 mars 2024 - {mentionLegalesVersion}</Typography>

        <Section id={anchors.DateMaj}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Date de la dernière mise à jour
          </Typography>
          <Typography>Ces mentions légales ont été mises à jour le 27/03/2024.</Typography>
        </Section>

        <Section id={anchors.EditeurPlateforme}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Éditeur de la plateforme
          </Typography>
          <Typography>
            La plateforme “Espace développeurs La bonne alternance” est éditée par la Délégation générale à l’emploi et
            à la formation professionnelle (DGEFP), située :
            <br />
            <br />
            14 avenue Duquesne
            <br /> 75007 Paris
            <br /> France
          </Typography>
        </Section>

        <Section id={anchors.DirecteurDeLaPublication}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Directeur de la publication
          </Typography>
          <Typography gutterBottom>
            Le directeur de la publication est Monsieur Jérôme MARCHAND-ARVIER, Délégué général à l’emploi et à la
            formation professionnelle.
          </Typography>
        </Section>

        <Section id={anchors.HebergementPlateforme}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Hébergement de la plateforme
          </Typography>
          <Typography>
            L'hébergement est assuré par OVH SAS, situé à l'adresse suivante :
            <br />
            2 rue Kellermann
            <br />
            59100 Roubaix
            <br />
            Standard : 09.72.10.07
            <br />
            <br />
            La conception et la réalisation du site sont effectuées par La Mission Interministérielle pour
            l'apprentissage, située à l'adresse suivante :
            <br />
            Beta.gouv
            <br />
            20 avenue de Ségur
            <br />
            75007 Paris
          </Typography>
        </Section>

        <Section id={anchors.Accessibilite}>
          <Typography
            variant="h2"
            gutterBottom
            id={anchors.Accessibilite}
            color={fr.colors.decisions.artwork.minor.blueEcume.default}
          >
            Accessibilité
          </Typography>
          <Typography>
            La conformité aux normes d’accessibilité numérique est une priorité, en cours de mise en œuvre et sera
            effective dans une prochaine version de cette plateforme.
            <br />
            <br />
            Pour en savoir plus sur la politique d’accessibilité numérique de l’État :
            https://accessibilite.numerique.gouv.fr/
          </Typography>
        </Section>

        <Section id={anchors.Securite}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Signaler un dysfonctionnement
          </Typography>
          <Typography>
            La plateforme est protégée par un certificat électronique, matérialisé pour la grande majorité des
            navigateurs par un cadenas. Cette protection participe à la confidentialité des échanges.
            <br />
            En aucun cas les services associés à la plateforme ne seront à l’origine d’envoi de courriels pour demander
            la saisie d’informations personnelles.
          </Typography>
        </Section>
      </Grid>
    </Grid>
  );
};

export default MentionsLegales;
