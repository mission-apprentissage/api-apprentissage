import { Summary } from "@codegouvfr/react-dsfr/Summary";
import { Grid, Typography } from "@mui/material";

import { publicConfig } from "../../../config.public";
import Section from "../../components/section/Section";

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
    <Grid container spacing={2}>
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
        <Typography variant="h2" gutterBottom>
          Mentions légales
        </Typography>

        <Typography>Mentions légales du site « {publicConfig.productMeta.productName} »</Typography>
        <Typography>Dernière mise à jour le : 23 mars 2024 - {mentionLegalesVersion}</Typography>

        <Section id={anchors.DateMaj}>
          <Typography variant="h3" gutterBottom>
            Date de la dernière mise à jour
          </Typography>
          <Typography>Ces mentions légales ont été mise à jour le 27/03/2024.</Typography>
        </Section>

        <Section id={anchors.EditeurPlateforme}>
          <Typography variant="h3" gutterBottom>
            Éditeur de la plateforme
          </Typography>
          <Typography>
            La plateforme “API Apprentissage” est éditée par la Délégation générale à l’emploi et à la formation
            professionnelle (DGEFP), située :
            <br />
            <br />
            14 avenue Duquesne
            <br /> 75007 Paris
            <br /> France
          </Typography>
        </Section>

        <Section id={anchors.DirecteurDeLaPublication}>
          <Typography variant="h3" gutterBottom>
            Directeur de la publication
          </Typography>
          <Typography gutterBottom>
            Le directeur de la publication est Monsieur Jérôme MARCHAND-ARVIER, Délégué général à l’emploi et à la
            formation professionnelle.
          </Typography>
        </Section>

        <Section id={anchors.HebergementPlateforme}>
          <Typography variant="h3" gutterBottom>
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
            La conception et la réalisation du site sont effectuée par La Mission Interministérielle pour
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
          <Typography variant="h3" gutterBottom id={anchors.Accessibilite}>
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
          <Typography variant="h3" gutterBottom>
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
