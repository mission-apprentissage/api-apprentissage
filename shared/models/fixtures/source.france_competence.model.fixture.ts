import { ObjectId } from "bson";

import { ISourceFranceCompetence } from "../source/france_competence/source.france_competence.model";
import { getFixtureValue } from "./fixture_helper";

type ISourceFranceCompetenceDataInput = Partial<
  Omit<ISourceFranceCompetence["data"], "standard"> & {
    standard?: Partial<ISourceFranceCompetence["data"]["standard"]>;
  }
>;

function generateSourceFranceCompetenceStandardFixture(
  input?: Partial<ISourceFranceCompetence["data"]["standard"]>
): ISourceFranceCompetence["data"]["standard"] {
  if (input === null) {
    return null;
  }

  return {
    Id_Fiche: getFixtureValue(input, "Id_Fiche", "16910"),
    Numero_Fiche: getFixtureValue(input, "Numero_Fiche", "RNCP1796"),
    Intitule: getFixtureValue(input, "Intitule", "Conducteur de travaux aménagement finitions"),
    Abrege_Libelle: getFixtureValue(input, "Abrege_Libelle", "TP"),
    Abrege_Intitule: getFixtureValue(input, "Abrege_Intitule", "Titre professionnel"),
    Nomenclature_Europe_Niveau: getFixtureValue(input, "Nomenclature_Europe_Niveau", "NIV5"),
    Nomenclature_Europe_Intitule: getFixtureValue(input, "Nomenclature_Europe_Intitule", "Niveau 5"),
    Accessible_Nouvelle_Caledonie: getFixtureValue(input, "Accessible_Nouvelle_Caledonie", "Non"),
    Accessible_Polynesie_Francaise: getFixtureValue(input, "Accessible_Polynesie_Francaise", "Non"),
    Date_dernier_jo: getFixtureValue(input, "Date_dernier_jo", "26/02/2019"),
    Date_Decision: getFixtureValue(input, "Date_Decision", null),
    Date_Fin_Enregistrement: getFixtureValue(input, "Date_Fin_Enregistrement", "07/05/2024"),
    Date_Effet: getFixtureValue(input, "Date_Effet", "07/05/2019"),
    Type_Enregistrement: getFixtureValue(input, "Type_Enregistrement", "Enregistrement de droit"),
    Validation_Partielle: getFixtureValue(input, "Validation_Partielle", null),
    Actif: getFixtureValue(input, "Actif", "ACTIVE"),
  };
}

export type ISourceFranceCompetenceFixtureInput = Partial<
  Omit<ISourceFranceCompetence, "data"> & {
    data?: ISourceFranceCompetenceDataInput;
  }
>;

export function generateSourceFranceCompetenceFixture(
  data?: ISourceFranceCompetenceFixtureInput
): ISourceFranceCompetence {
  const numeroFiche = getFixtureValue(data, "numero_fiche", "RNCP1796");

  return {
    _id: getFixtureValue(data, "_id", new ObjectId()),
    numero_fiche: numeroFiche,
    active: getFixtureValue(data, "active", true),
    created_at: getFixtureValue(data, "created_at", new Date("2024-03-05T09:32:27.104Z")),
    date_derniere_activation: getFixtureValue(data, "date_derniere_activation", new Date("2024-03-05T00:00:00.000Z")),
    date_derniere_publication: getFixtureValue(data, "date_derniere_publication", new Date("2024-03-05T00:00:00.000Z")),
    date_premiere_activation: getFixtureValue(data, "date_premiere_activation", new Date("2021-12-24T00:00:00.000Z")),
    date_premiere_publication: getFixtureValue(data, "date_premiere_publication", new Date("2021-12-24T00:00:00.000Z")),
    source: getFixtureValue(data, "source", "rncp"),
    updated_at: getFixtureValue(data, "updated_at", new Date("2024-03-05T09:32:27.106Z")),
    files: getFixtureValue(data, "files", {
      "3651f1ea-ad81-42d6-a7ae-7b40af3c6117": {
        nom: "export-fiches-csv-2022-02-12.zip",
        last_updated: new Date("2022-02-12T04:00:20.941Z"),
        date_publication: new Date("2022-02-12T00:00:00.000Z"),
      },
    }),
    data: {
      ccn: getFixtureValue(data?.data, "ccn", [
        {
          Numero_Fiche: numeroFiche,
          Ccn_1_Numero: "3109",
          Ccn_1_Libelle: "Métallurgie",
          Ccn_2_Numero: null,
          Ccn_2_Libelle: null,
          Ccn_3_Numero: null,
          Ccn_3_Libelle: null,
        },
      ]),
      partenaires: getFixtureValue(data?.data, "partenaires", [
        {
          Numero_Fiche: numeroFiche,
          Nom_Partenaire: "AGENCE NATIONALE POUR LA FORMATION PROFESSIONNELLE DES ADULTES",
          Siret_Partenaire: "82422814201189",
          Habilitation_Partenaire: "HABILITATION_ORGA_FORM",
        },
      ]),
      blocs_de_competences: getFixtureValue(data?.data, "blocs_de_competences", [
        {
          Numero_Fiche: numeroFiche,
          Bloc_Competences_Code: "RNCP1796BC03",
          Bloc_Competences_Libelle:
            "Conduire les travaux de chantiers de plusieurs spécialités en aménagement finitions",
        },
      ]),
      nsf: getFixtureValue(data?.data, "nsf", [
        {
          Numero_Fiche: numeroFiche,
          Nsf_Code: "233",
          Nsf_Intitule: "233 : Bâtiment : finitions",
        },
      ]),
      formacode: getFixtureValue(data?.data, "formacode", [
        {
          Numero_Fiche: numeroFiche,
          Formacode_Code: "22293",
          Formacode_Libelle: "22293 : Conduite travaux BTP",
        },
      ]),
      ancienne_nouvelle_certification: getFixtureValue(data?.data, "ancienne_nouvelle_certification", []),
      voies_d_acces: getFixtureValue(data?.data, "voies_d_acces", [
        {
          Numero_Fiche: numeroFiche,
          Si_Jury: "En contrat de professionnalisation",
        },
        {
          Numero_Fiche: numeroFiche,
          Si_Jury: "En contrat d’apprentissage",
        },
        {
          Numero_Fiche: numeroFiche,
          Si_Jury: "Après un parcours de formation continue",
        },
        {
          Numero_Fiche: numeroFiche,
          Si_Jury: "Par expérience",
        },
      ]),
      rome: getFixtureValue(data?.data, "rome", [
        {
          Numero_Fiche: numeroFiche,
          Codes_Rome_Code: "F1201",
          Codes_Rome_Libelle: "Conduite de travaux du BTP et de travaux paysagers",
        },
      ]),
      certificateurs: getFixtureValue(data?.data, "certificateurs", [
        {
          Numero_Fiche: numeroFiche,
          Siret_Certificateur: "11000007200014",
          Nom_Certificateur: "MINISTERE DU TRAVAIL DU PLEIN EMPLOI ET DE L' INSERTION",
        },
      ]),
      standard: generateSourceFranceCompetenceStandardFixture(data?.data?.standard),
    },
  };
}
