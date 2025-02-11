import { fr } from "@codegouvfr/react-dsfr";
import { Summary } from "@codegouvfr/react-dsfr/Summary";
import { Table } from "@codegouvfr/react-dsfr/Table";
import { Grid, Typography } from "@mui/material";

import Section from "@/components/section/Section";

const anchors = {
  QuiEstResponsable: "qui-est-responsable",
  PourquoiTraitonsNousDesDonnees: "pourquoi-traitons-nous-donnees",
  QuellesSontLesDonneesACaracterePersonnel: "quelles-sont-donnees-caractere-personnel",
  QuEstCeQuiNousAutoriseATraiterDonneesCaracterePersonnel: "qu-est-ce-qui-autorise-donnees-caractere-personnel",
  PendantCombienTpsConservonsNousDonnees: "pendant-combien-tps-conservons-nous-donnees",
  VosDroitsSurDonneesVousConcernant: "vos-droits-donnees-vous-concernant",
  QuiVaAvoirAccessDonnees: "qui-va-avoir-acces-donnees",
  QuiNousAideTraiterDonnees: "qui-aide-traiter-donnees",
};

const summaryData = [
  { anchorName: "Qui est responsable", anchorLink: "responsable" },
  {
    anchorName: "Pourquoi traitons-nous des données",
    anchorLink: "pourquoi-traitons-nous-donnees",
  },
  {
    anchorName: "Quelles sont les données à caractère personnel que nous traitons",
    anchorLink: "quelles-sont-donnees-caractere-personnel",
  },
  {
    anchorName: "Qu’est-ce qui nous autorise à traiter des données à caractère personnel",
    anchorLink: "qu-est-ce-qui-autorise-donnees-caractere-personnel",
  },
  {
    anchorName: "Pendant combien de temps conservons-nous ces données",
    anchorLink: "pendant-combien-tps-conservons-nous-donnees",
  },
  {
    anchorName: "Vos droits sur les données vous concernant",
    anchorLink: "vos-droits-donnees-vous-concernant",
  },
  {
    anchorName: "Qui va avoir accès à ces données",
    anchorLink: "qui-va-avoir-acces-donnees",
  },
  {
    anchorName: "Qui nous aide à traiter vos données",
    anchorLink: "qui-aide-traiter-donnees",
  },
];

const PolitiqueDeConfidentialite = () => {
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
          Politique de confidentialité
        </Typography>

        <Section mt={4} id={anchors.QuiEstResponsable}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Qui est responsable ?
          </Typography>
          <Typography>
            Le ministère du Travail, du Plein emploi et de l’insertion traite des données à caractère personnel dans le
            cadre de “l’espace développeurs La bonne alternance” en qualité de responsable de traitement. L’espace
            développeurs La bonne alternance est développé au sein de la Mission Interministérielle pour
            l’Apprentissage. <br />
            L’objectif poursuivi est de simplifier l’accès à des données de l’apprentissage fiables et à jour grâce à un
            point d’entrée unique et documenté.
          </Typography>
        </Section>

        <Section mt={4} id={anchors.PourquoiTraitonsNousDesDonnees}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Pourquoi traitons-nous des données ?
          </Typography>
          <Typography>
            Le ministère du Travail, du Plein emploi et de l’insertion traite des données à caractère personnel dans le
            cadre de l’utilisation de l’espace développeurs La bonne alternance pour :
          </Typography>
          <ul>
            <li>Gérer les comptes utilisateurs et les jetons d’accès de l’API.</li>
          </ul>
        </Section>

        <Section id={anchors.QuellesSontLesDonneesACaracterePersonnel}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Quelles sont les données à caractère personnel que nous traitons ?
          </Typography>
          <Typography>Les données à caractère personnel concernées sont les suivantes :</Typography>
          <ul>
            <li>Données du compte utilisateur Espace développeurs La bonne alternance : adresse e-mail.</li>
          </ul>
        </Section>

        <Section mt={4} id={anchors.QuEstCeQuiNousAutoriseATraiterDonneesCaracterePersonnel}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Qu’est-ce qui nous autorise à traiter des données à caractère personnel ?
          </Typography>
          <Typography>
            Les données à caractère personnel susvisées sont traitées par le biais de l’exécution d’une mission
            d’intérêt public ou relevant de l’exercice de l’autorité publique dont est investi le responsable de
            traitement au sens de l’article 6-1 e) du RGPD.
          </Typography>
        </Section>

        <Section mt={4} id={anchors.PendantCombienTpsConservonsNousDonnees}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Pendant combien de temps conservons-nous ces données ?
          </Typography>
          <Table
            data={[
              [
                "Données du compte utilisateur Espace développeurs La bonne alternance",
                "2 ans à compter de la dernière utilisation du compte par l’utilisateur",
              ],
            ]}
            headers={["Catégorie de données", "Durées de conservation"]}
          />
        </Section>

        <Section mt={4} id={anchors.VosDroitsSurDonneesVousConcernant}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Vos droits sur les données vous concernant
          </Typography>
          <Typography>Vous disposez des droits suivants concernant vos données à caractère personnel :</Typography>
          <br />
          <ul>
            <li>Droit d’information et droit d’accès aux données ;</li>
            <li>Droit de rectification des données ;</li>
            <li>Droit à la limitation du traitement de vos données ;</li>
            <li>Droit d’opposition.</li>
          </ul>
          <Typography>
            Vous pouvez exercer vos droits en adressant un courrier à la Déléguée à la protection des données à
            l’adresse suivante :
            <br />
            <br />
            127 rue de Grenelle
            <br />
            <br />
            75007 Paris
            <br />
            <br />
            Pour les exercer vous pouvez nous contacter par mail à l’adresse suivante : api@apprentissage.beta.gouv.fr
            <br />
            Nous nous engageons à vous répondre dans un délai d’un mois à compter de la réception de votre demande.
            <br />
            Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés ou que le traitement n’est
            pas conforme à la réglementation sur la protection des données à caractère personnel, vous pouvez adresser
            une réclamation à la CNIL :
            <a href="https://www.cnil.fr/fr/cnil-direct/question/adresser-une-reclamation-plainte-la-cnil-quelles-conditions-et-comment">
              https://www.cnil.fr/fr/cnil-direct/question/adresser-une-reclamation-plainte-la-cnil-quelles-conditions-et-comment
            </a>
          </Typography>
        </Section>

        <Section mt={4} id={anchors.QuiVaAvoirAccessDonnees}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Qui va avoir accès à ces données ?
          </Typography>
          <Typography>
            Les accès aux données sont strictement encadrés et juridiquement justifiés. Les personnes suivantes, les
            destinataires, vont avoir accès aux données :
          </Typography>
          <ul>
            <li>
              La Délégation générale à l’emploi et à la formation professionnelle (DGEFP) et les membres de la Mission
              interministérielle pour l’Apprentissage et plus spécifiquement de l’équipe Espace développeurs La bonne
              alternance ;
            </li>
          </ul>
        </Section>

        <Section mt={4} id={anchors.QuiNousAideTraiterDonnees}>
          <Typography variant="h2" gutterBottom color={fr.colors.decisions.artwork.minor.blueEcume.default}>
            Qui nous aide à traiter vos données ?
          </Typography>
          <Typography>
            Certaines des données sont envoyées à des sous-traitants pour réaliser certaines missions. Le responsable de
            traitement s'est assuré de la mise en œuvre par ses sous-traitants de garanties adéquates et du respect de
            conditions strictes de confidentialité et de sécurité.
          </Typography>
          <ul>
            <li>
              OVH
              <ul>
                <li>Traitement réalisé : Hébergement</li>
                <li>Pays destinataire des données : France</li>
                <li>
                  Garanties :
                  <a href="https://us.ovhcloud.com/legal/data-processing-agreement/">
                    https://us.ovhcloud.com/legal/data-processing-agreement/
                  </a>
                </li>
              </ul>
            </li>
            <li>
              Brevo
              <ul>
                <li>Traitement réalisé : Envoi d'e-mails</li>
                <li>Pays destinataire des données : France</li>
                <li>
                  Garanties :
                  <a href="https://www.brevo.com/fr/legal/termsofuse/">https://www.brevo.com/fr/legal/termsofuse/</a>
                </li>
              </ul>
            </li>
          </ul>
          <Typography>
            L'espace développeurs La bonne alternance utilise notamment l’outil de mesure d’audience Plausible, qui ne
            dépose aucun cookie ou traceur et ne traite pas de données à caractère personnel.
          </Typography>
        </Section>
      </Grid>
    </Grid>
  );
};
export default PolitiqueDeConfidentialite;
