import { createReadStream } from "fs";
import { dirname, join } from "path";
import { Readable } from "stream";
import { fileURLToPath } from "url";
import { stringify } from "csv-stringify";
import { addJob } from "job-processor";
import { ObjectId } from "mongodb";
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock";
import type { IDataGouvDataset } from "shared";
import type { IImportMetaFranceCompetence } from "shared/models/import.meta.model";
import type { ISourceFcStandard } from "shared/models/source/france_competence/parts/source.france_competence.standard.model";
import { zSourceFcStandard } from "shared/models/source/france_competence/parts/source.france_competence.standard.model";
import type {
  IFranceCompetenceDataBySource,
  ISourceFranceCompetence,
  ISourceFranceCompetenceDataKey,
} from "shared/models/source/france_competence/source.france_competence.model";
import { zFranceCompetenceDataBySourceShape } from "shared/models/source/france_competence/source.france_competence.model";
import type { Entry } from "unzipper";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  importRncpArchive,
  importRncpFile,
  onImportRncpArchiveFailure,
  processRecord,
  runRncpImporter,
} from "./france_competence.importer.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

import { useMongo } from "@tests/mongo.test.utils.js";
import { fetchDataGouvDataSet } from "@/services/apis/data_gouv/data_gouv.api.js";

vi.mock("job-processor", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await importOriginal()) as any;
  return {
    ...mod,
    addJob: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock("@/services/apis/data_gouv/data_gouv.api", async (importOriginal) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod = (await importOriginal()) as any;
  return {
    ...mod,
    fetchDataGouvDataSet: vi.fn(),
  };
});

const mockSourceData = {
  ccn: [
    {
      Numero_Fiche: "RNCP001",
      Ccn_1_Numero: null,
      Ccn_1_Libelle: null,
      Ccn_2_Numero: null,
      Ccn_2_Libelle: null,
      Ccn_3_Numero: null,
      Ccn_3_Libelle: null,
    },
  ],
  partenaires: [
    {
      Numero_Fiche: "RNCP001",
      Nom_Partenaire: null,
      Siret_Partenaire: null,
      Habilitation_Partenaire: null,
    },
  ],
  blocs_de_competences: [
    {
      Numero_Fiche: "RNCP001",
      Bloc_Competences_Code: "RNCP001BC1",
      Bloc_Competences_Libelle: null,
    },
  ],
  nsf: [
    {
      Numero_Fiche: "RNCP001",
      Nsf_Code: "123456",
      Nsf_Intitule: null,
    },
  ],
  formacode: [
    {
      Numero_Fiche: "RNCP001",
      Formacode_Code: "123456",
      Formacode_Libelle: "Intitulé Formacode",
    },
  ],
  ancienne_nouvelle_certification: [
    {
      Numero_Fiche: "RNCP001",
      Ancienne_Certification: null,
      Nouvelle_Certification: null,
    },
  ],
  voies_d_acces: [
    {
      Numero_Fiche: "RNCP001",
      Si_Jury: null,
    },
  ],
  rome: [
    {
      Numero_Fiche: "RNCP001",
      Codes_Rome_Code: "12345",
      Codes_Rome_Libelle: "Intitulé ROME",
    },
  ],
  certificateurs: [
    {
      Numero_Fiche: "RNCP001",
      Siret_Certificateur: "12345678901234",
      Nom_Certificateur: "Certificateur Test",
    },
  ],
  standard: {
    Id_Fiche: "Id_Fiche",
    Intitule: "Intitule",
    Abrege_Libelle: null,
    Abrege_Intitule: null,
    Nomenclature_Europe_Niveau: null,
    Nomenclature_Europe_Intitule: null,
    Accessible_Nouvelle_Caledonie: null,
    Accessible_Polynesie_Francaise: null,
    Date_dernier_jo: null,
    Date_Decision: null,
    Date_Fin_Enregistrement: null,
    Date_Effet: null,
    Type_Enregistrement: "Enregistrement de droit",
    Validation_Partielle: null,
    Numero_Fiche: "RNCP001",
    Actif: "ACTIVE",
  },
} as const satisfies IFranceCompetenceDataBySource;

const mockSourceData2 = {
  ccn: [
    {
      Numero_Fiche: "RNCP001",
      Ccn_1_Numero: "3090",
      Ccn_1_Libelle: "Ccn_1_Libelle",
      Ccn_2_Numero: null,
      Ccn_2_Libelle: null,
      Ccn_3_Numero: null,
      Ccn_3_Libelle: null,
    },
  ],
  partenaires: [
    {
      Numero_Fiche: "RNCP001",
      Nom_Partenaire: "GROUPE QUEGUINER",
      Siret_Partenaire: "48261176100016",
      Habilitation_Partenaire: "HABILITATION_ORGA_FORM",
    },
    {
      Numero_Fiche: "RNCP001",
      Nom_Partenaire: "ANAKAE",
      Siret_Partenaire: "89456004400014",
      Habilitation_Partenaire: "HABILITATION_ORGA_FORM",
    },
  ],
  blocs_de_competences: [
    {
      Numero_Fiche: "RNCP001",
      Bloc_Competences_Code: "RNCP001BC02",
      Bloc_Competences_Libelle:
        "Organisation, information et communication autour de ses activités d’animation et d’encadrement physique et sportif",
    },
    {
      Numero_Fiche: "RNCP001",
      Bloc_Competences_Code: "RNCP001BC03",
      Bloc_Competences_Libelle:
        "Préparation et entretien du matériel et des bateaux à moteur spécifiques aux différents modes de pratique du parachutisme ascensionnel nautique",
    },
    {
      Numero_Fiche: "RNCP001",
      Bloc_Competences_Code: "RNCP001BC01",
      Bloc_Competences_Libelle:
        "Préparation et animation d’une séance en sécurité de parachutisme ascensionnel nautique",
    },
  ],
  nsf: [
    {
      Numero_Fiche: "RNCP001",
      Nsf_Code: "335",
      Nsf_Intitule: "335 : Animation sportive, culturelle et de Loisirs",
    },
    {
      Numero_Fiche: "RNCP001",
      Nsf_Code: "411",
      Nsf_Intitule: "411 : Pratiques sportives (y compris : arts martiaux)",
    },
  ],
  formacode: [
    {
      Numero_Fiche: "RNCP001",
      Formacode_Code: "15472",
      Formacode_Libelle: "Sport nautique",
    },
    {
      Numero_Fiche: "RNCP001",
      Formacode_Code: "15436",
      Formacode_Libelle: "Éducation sportive",
    },
  ],
  ancienne_nouvelle_certification: [
    {
      Numero_Fiche: "RNCP001",
      Ancienne_Certification: "RNCP27857",
      Nouvelle_Certification: null,
    },
    {
      Numero_Fiche: "RNCP001",
      Ancienne_Certification: "RNCP27853",
      Nouvelle_Certification: null,
    },
  ],
  voies_d_acces: [
    {
      Numero_Fiche: "RNCP001",
      Si_Jury: "Après un parcours de formation continue",
    },
    {
      Numero_Fiche: "RNCP001",
      Si_Jury: "Par expérience",
    },
    {
      Numero_Fiche: "RNCP001",
      Si_Jury: "En contrat de professionnalisation",
    },
  ],
  rome: [
    {
      Numero_Fiche: "RNCP001",
      Codes_Rome_Code: "I1203",
      Codes_Rome_Libelle: "Maintenance des bâtiments et des locaux",
    },
    {
      Numero_Fiche: "RNCP001",
      Codes_Rome_Code: "K2501",
      Codes_Rome_Libelle: "Gardiennage de locaux",
    },
  ],
  certificateurs: [
    {
      Numero_Fiche: "RNCP001",
      Siret_Certificateur: "19753471200017",
      Nom_Certificateur: "CONSERVATOIRE NATIONAL DES ARTS ET METIERS",
    },
    {
      Numero_Fiche: "RNCP001",
      Siret_Certificateur: "11004401300040",
      Nom_Certificateur: "MINISTERE DE L'ENSEIGNEMENT SUPERIEUR ET DE LA RECHERCHE",
    },
  ],
  standard: {
    Id_Fiche: "4637",
    Numero_Fiche: "RNCP001",
    Intitule: "Assistant de structure vétérinaire",
    Abrege_Libelle: null,
    Abrege_Intitule: null,
    Nomenclature_Europe_Niveau: "NIV4",
    Nomenclature_Europe_Intitule: "niveau4",
    Accessible_Nouvelle_Caledonie: "Non",
    Accessible_Polynesie_Francaise: "Non",
    Date_dernier_jo: "21/07/2018",
    Date_Decision: null,
    Date_Fin_Enregistrement: "21/07/2021",
    Date_Effet: null,
    Type_Enregistrement: "Enregistrement sur demande",
    Validation_Partielle: null,
    Actif: "INACTIVE",
  },
} as const satisfies IFranceCompetenceDataBySource;

// Spec de l'algorithme https://www.notion.so/mission-apprentissage/Job-d-import-des-donn-es-RNCP-via-France-Comp-tences-v1-0-66efcd3edce84bd09db34a9e7f8a0d73
describe("processRecord", () => {
  const archiveMeta = {
    date_publication: new Date("2024-02-21T23:00:00.000Z"),
    nom: "export-fiches-csv-2024-02-22.zip",
    last_updated: new Date("2024-02-22T03:02:07.320000+00:00"),
    resource: {
      created_at: new Date("2024-02-22T03:02:02.578000+00:00"),
      id: "f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
      last_modified: new Date("2024-02-22T03:02:07.320000+00:00"),
      latest: "https://www.data.gouv.fr/fr/datasets/r/f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
      title: "export-fiches-csv-2024-02-22.zip",
    },
  };

  const importMeta = {
    import_date: new Date("2024-02-22T09:00:00.000Z"),
    type: "france_competence",
    _id: new ObjectId(),
    archiveMeta,
    status: "pending",
  } as const;

  const numeroFiche = "RNCP123";

  const expectedInitialData = {
    _id: expect.any(ObjectId),
    active: null,
    created_at: importMeta.import_date,
    updated_at: importMeta.import_date,
    date_premiere_publication: null,
    date_derniere_publication: null,
    date_premiere_activation: null,
    date_derniere_activation: null,
    source: "rncp",
    data: {
      ccn: [],
      partenaires: [],
      blocs_de_competences: [],
      nsf: [],
      formacode: [],
      ancienne_nouvelle_certification: [],
      voies_d_acces: [],
      rome: [],
      certificateurs: [],
      standard: null,
    },
  };

  const expectedCreateRecord = {
    updateOne: {
      filter: { numero_fiche: numeroFiche },
      update: {
        $setOnInsert: expectedInitialData,
      },
      upsert: true,
    },
  };

  const expectedUpdateDateDernierePublication = {
    updateOne: {
      filter: {
        $or: [
          {
            numero_fiche: numeroFiche,
            date_derniere_publication: { $lt: archiveMeta.date_publication },
          },
          {
            numero_fiche: numeroFiche,
            date_derniere_publication: null,
          },
        ],
      },
      update: {
        $set: {
          updated_at: importMeta.import_date,
          date_derniere_publication: archiveMeta.date_publication,
          data: expectedInitialData.data,
        },
      },
    },
  };

  const expectedUpdateDatePremierePublication = {
    updateOne: {
      filter: {
        $or: [
          {
            numero_fiche: numeroFiche,
            date_premiere_publication: { $gt: archiveMeta.date_publication },
          },
          {
            numero_fiche: numeroFiche,
            date_premiere_publication: null,
          },
        ],
      },
      update: {
        $set: {
          updated_at: importMeta.import_date,
          date_premiere_publication: archiveMeta.date_publication,
        },
      },
    },
  };

  describe("when fichier is standard", () => {
    const fichierMeta = { source: "standard" } as const;
    const columns = Object.keys(zSourceFcStandard.shape).map((key) => ({ name: key }));

    const expectedSetFileMeta = {
      updateOne: {
        filter: { numero_fiche: numeroFiche },
        update: {
          $set: {
            updated_at: importMeta.import_date,
          },
        },
      },
    };

    describe("when fiche is active", () => {
      it("should create a new record properly", () => {
        const record = {
          ...mockSourceData.standard,
          Numero_Fiche: "RNCP123",
          Actif: "ACTIVE",
        };

        const result = processRecord(importMeta, fichierMeta, record, columns);

        expect(result).toEqual([
          expectedCreateRecord,
          expectedSetFileMeta,
          expectedUpdateDateDernierePublication,
          expectedUpdateDatePremierePublication,
          {
            updateOne: {
              filter: {
                numero_fiche: record.Numero_Fiche,
                date_derniere_publication: archiveMeta.date_publication,
              },
              update: {
                $set: {
                  updated_at: importMeta.import_date,
                  "data.standard": record,
                  active: true,
                },
              },
            },
          },
          {
            updateOne: {
              filter: {
                numero_fiche: record.Numero_Fiche,
                date_premiere_activation: null,
              },
              update: {
                $set: {
                  updated_at: importMeta.import_date,
                  date_premiere_activation: archiveMeta.date_publication,
                  date_derniere_activation: archiveMeta.date_publication,
                },
              },
            },
          },
          {
            updateOne: {
              filter: {
                numero_fiche: record.Numero_Fiche,
                date_premiere_activation: { $gt: archiveMeta.date_publication },
              },
              update: {
                $set: {
                  updated_at: importMeta.import_date,
                  date_premiere_activation: archiveMeta.date_publication,
                },
              },
            },
          },
          {
            updateOne: {
              filter: {
                numero_fiche: record.Numero_Fiche,
                date_derniere_activation: { $lt: archiveMeta.date_publication },
              },
              update: {
                $set: {
                  updated_at: importMeta.import_date,
                  date_derniere_activation: archiveMeta.date_publication,
                },
              },
            },
          },
        ]);
      });
    });

    describe("when fiche is inactive", () => {
      it("should create a new record properly", () => {
        const record = {
          ...mockSourceData.standard,
          Numero_Fiche: "RNCP123",
          Actif: "INACTIVE",
        };

        expect(record.Actif).toBe("INACTIVE");

        const result = processRecord(importMeta, fichierMeta, record, columns);

        expect(result).toEqual([
          expectedCreateRecord,
          expectedSetFileMeta,
          expectedUpdateDateDernierePublication,
          expectedUpdateDatePremierePublication,
          {
            updateOne: {
              filter: {
                numero_fiche: record.Numero_Fiche,
                date_derniere_publication: archiveMeta.date_publication,
              },
              update: {
                $set: {
                  updated_at: importMeta.import_date,
                  "data.standard": record,
                  active: false,
                },
              },
            },
          },
        ]);
      });
    });
  });

  describe.each<[Exclude<keyof ISourceFranceCompetence["data"], "standard">]>([["ccn"]])(
    "when fichier is %s",
    (source) => {
      const fichierMeta = { source } as const;
      const columns = Object.keys(zFranceCompetenceDataBySourceShape[source].shape).map((key) => ({ name: key }));

      it("should create a new record properly", () => {
        const record = {
          ...mockSourceData[source][0],
          Numero_Fiche: "RNCP123",
        };

        const result = processRecord(importMeta, fichierMeta, record, columns);

        expect(result).toEqual([
          expectedCreateRecord,
          expectedUpdateDateDernierePublication,
          expectedUpdateDatePremierePublication,
          {
            updateOne: {
              filter: {
                numero_fiche: record.Numero_Fiche,
                date_derniere_publication: archiveMeta.date_publication,
              },
              update: {
                $set: {
                  updated_at: importMeta.import_date,
                },
                $addToSet: {
                  [`data.${source}`]: record,
                },
              },
            },
          },
        ]);
      });
    }
  );
});

function mockEntry<T extends object>(path: string, data: T[]): Entry {
  const entry = Readable.from(data).pipe(
    stringify({
      header: true,
      columns: Object.keys(data[0]),
      delimiter: ";",
    })
  ) as unknown as Entry;
  entry.path = path;
  return entry;
}

describe("importRncpFile", () => {
  useMongo();

  describe("when file is standard", () => {
    const archiveMeta = {
      date_publication: new Date("2024-02-21T23:00:00.000Z"),
      nom: "export-fiches-csv-2024-02-22.zip",
      last_updated: new Date("2024-02-22T03:02:07.320000+00:00"),
      resource: {
        created_at: new Date("2024-02-22T03:02:02.578000+00:00"),
        id: "f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
        last_modified: new Date("2024-02-22T03:02:07.320000+00:00"),
        latest: "https://www.data.gouv.fr/fr/datasets/r/0002",
        title: "export-fiches-csv-2024-02-22.zip",
      },
    };

    const importMeta = {
      import_date: new Date("2024-02-22T09:00:00.000Z"),
      type: "france_competence",
      _id: new ObjectId(),
      archiveMeta,
      status: "pending",
    } as const;

    describe("when fiche does not exist", () => {
      it("it should create fiche", async () => {
        const data = [
          {
            ...mockSourceData.standard,
            Numero_Fiche: "RNCP001",
            Actif: "ACTIVE",
          },
        ];

        const entry = mockEntry("export_fiches_CSV_Standard_2024_02_22.csv", data);

        await importRncpFile(entry, importMeta);

        expect(await getDbCollection("source.france_competence").find({}).toArray()).toEqual([
          {
            _id: expect.any(ObjectId),
            numero_fiche: "RNCP001",
            active: true,
            created_at: importMeta.import_date,
            updated_at: importMeta.import_date,
            date_premiere_publication: archiveMeta.date_publication,
            date_derniere_publication: archiveMeta.date_publication,
            date_premiere_activation: archiveMeta.date_publication,
            date_derniere_activation: archiveMeta.date_publication,
            source: "rncp",
            data: {
              ccn: [],
              partenaires: [],
              blocs_de_competences: [],
              nsf: [],
              formacode: [],
              ancienne_nouvelle_certification: [],
              voies_d_acces: [],
              rome: [],
              certificateurs: [],
              standard: data[0],
            },
          },
        ]);
      });
    });

    describe("when file is more recent", () => {
      const initialFicheActive: ISourceFranceCompetence = {
        _id: new ObjectId(),
        numero_fiche: "RNCP001",
        active: true,
        created_at: new Date("2024-02-21T09:00:00.000Z"),
        updated_at: new Date("2024-02-21T09:00:00.000Z"),
        date_premiere_publication: new Date("2024-02-21T09:00:00.000Z"),
        date_derniere_publication: new Date("2024-02-21T09:00:00.000Z"),
        date_premiere_activation: new Date("2024-02-21T09:00:00.000Z"),
        date_derniere_activation: new Date("2024-02-21T09:00:00.000Z"),
        source: "rncp",
        data: {
          ...mockSourceData,
          standard: {
            ...mockSourceData.standard,
            Numero_Fiche: "RNCP001",
            Actif: "ACTIVE",
          },
        },
      };

      const initialFicheInactive: ISourceFranceCompetence = {
        ...initialFicheActive,
        active: false,
        date_premiere_activation: null,
        date_derniere_activation: null,
        data: {
          ...initialFicheActive.data,
          standard: {
            ...mockSourceData.standard,
            Numero_Fiche: "RNCP001",
            Actif: "ACTIVE",
          },
        },
      };

      const activeStandardData: ISourceFcStandard = {
        ...mockSourceData.standard,
        Numero_Fiche: "RNCP001",
        Actif: "ACTIVE",
      };

      const inactiveStandardData: ISourceFcStandard = {
        ...mockSourceData.standard,
        Numero_Fiche: "RNCP001",
        Actif: "INACTIVE",
      };

      describe("when fiche active -> active", () => {
        it("it should update fiche", async () => {
          await getDbCollection("source.france_competence").insertOne(initialFicheActive);

          const entry = mockEntry("export_fiches_CSV_Standard_2024_02_22.csv", [activeStandardData]);

          await importRncpFile(entry, importMeta);

          expect(await getDbCollection("source.france_competence").find({}).toArray()).toEqual([
            {
              ...initialFicheActive,
              updated_at: importMeta.import_date,
              date_derniere_publication: archiveMeta.date_publication,
              date_derniere_activation: archiveMeta.date_publication,
              data: {
                ccn: [],
                partenaires: [],
                blocs_de_competences: [],
                nsf: [],
                formacode: [],
                ancienne_nouvelle_certification: [],
                voies_d_acces: [],
                rome: [],
                certificateurs: [],
                standard: activeStandardData,
              },
            },
          ]);
        });
      });

      describe("when fiche active -> inactive", () => {
        it("it should update fiche", async () => {
          await getDbCollection("source.france_competence").insertOne(initialFicheActive);

          const entry = mockEntry("export_fiches_CSV_Standard_2024_02_22.csv", [inactiveStandardData]);

          await importRncpFile(entry, importMeta);

          expect(await getDbCollection("source.france_competence").find({}).toArray()).toEqual([
            {
              ...initialFicheActive,
              active: false,
              updated_at: importMeta.import_date,
              date_derniere_publication: archiveMeta.date_publication,
              data: {
                ccn: [],
                partenaires: [],
                blocs_de_competences: [],
                nsf: [],
                formacode: [],
                ancienne_nouvelle_certification: [],
                voies_d_acces: [],
                rome: [],
                certificateurs: [],
                standard: inactiveStandardData,
              },
            },
          ]);
        });
      });

      describe("when fiche inactive -> active", () => {
        it("it should update fiche", async () => {
          await getDbCollection("source.france_competence").insertOne(initialFicheInactive);

          const entry = mockEntry("export_fiches_CSV_Standard_2024_02_22.csv", [activeStandardData]);

          await importRncpFile(entry, importMeta);

          expect(await getDbCollection("source.france_competence").find({}).toArray()).toEqual([
            {
              ...initialFicheInactive,
              updated_at: importMeta.import_date,
              active: true,
              date_derniere_publication: archiveMeta.date_publication,
              date_premiere_activation: archiveMeta.date_publication,
              date_derniere_activation: archiveMeta.date_publication,
              data: {
                ccn: [],
                partenaires: [],
                blocs_de_competences: [],
                nsf: [],
                formacode: [],
                ancienne_nouvelle_certification: [],
                voies_d_acces: [],
                rome: [],
                certificateurs: [],
                standard: activeStandardData,
              },
            },
          ]);
        });
      });

      describe("when fiche inactive -> inactive", () => {
        it("it should update fiche", async () => {
          await getDbCollection("source.france_competence").insertOne(initialFicheInactive);

          const entry = mockEntry("export_fiches_CSV_Standard_2024_02_22.csv", [inactiveStandardData]);

          await importRncpFile(entry, importMeta);

          expect(await getDbCollection("source.france_competence").find({}).toArray()).toEqual([
            {
              ...initialFicheInactive,
              updated_at: importMeta.import_date,
              date_derniere_publication: archiveMeta.date_publication,
              data: {
                ccn: [],
                partenaires: [],
                blocs_de_competences: [],
                nsf: [],
                formacode: [],
                ancienne_nouvelle_certification: [],
                voies_d_acces: [],
                rome: [],
                certificateurs: [],
                standard: inactiveStandardData,
              },
            },
          ]);
        });
      });
    });

    describe("when file is from same archive", () => {
      it("should update fiche without removing other sources data", async () => {
        const initialFiche: ISourceFranceCompetence = {
          _id: new ObjectId(),
          numero_fiche: "RNCP001",
          active: null,
          created_at: importMeta.import_date,
          updated_at: importMeta.import_date,
          date_premiere_publication: archiveMeta.date_publication,
          date_derniere_publication: archiveMeta.date_publication,
          date_premiere_activation: null,
          date_derniere_activation: null,
          source: "rncp",
          data: {
            ...mockSourceData,
            standard: null,
          },
        };

        const standardData: ISourceFcStandard = {
          ...mockSourceData.standard,
          Numero_Fiche: "RNCP001",
          Actif: "ACTIVE",
        };
        await getDbCollection("source.france_competence").insertOne(initialFiche);

        const entry = mockEntry("export_fiches_CSV_Standard_2024_02_22.csv", [standardData]);

        await importRncpFile(entry, importMeta);

        expect(await getDbCollection("source.france_competence").find({}).toArray()).toEqual([
          {
            ...initialFiche,
            updated_at: importMeta.import_date,
            active: true,
            date_derniere_publication: archiveMeta.date_publication,
            date_premiere_activation: archiveMeta.date_publication,
            date_derniere_activation: archiveMeta.date_publication,
            data: {
              ...initialFiche.data,
              standard: standardData,
            },
          },
        ]);
      });
    });

    describe("when file is older", () => {
      const archiveMetaOlder = {
        date_publication: new Date("2024-02-01T00:00:00.000Z"),
        nom: "export-fiches-csv-2024-02-01.zip",
        last_updated: new Date("2024-02-01T03:02:07.320000+00:00"),
        resource: {
          created_at: new Date("2024-02-01T03:02:02.578000+00:00"),
          id: "f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
          last_modified: new Date("2024-02-01T03:02:07.320000+00:00"),
          latest: "https://www.data.gouv.fr/fr/datasets/r/0002",
          title: "export-fiches-csv-2024-02-01.zip",
        },
      };

      const initialFicheActive: ISourceFranceCompetence = {
        _id: new ObjectId(),
        numero_fiche: "RNCP001",
        active: true,
        created_at: new Date("2024-02-21T09:00:00.000Z"),
        updated_at: new Date("2024-02-21T09:00:00.000Z"),
        date_premiere_publication: new Date("2024-02-21T09:00:00.000Z"),
        date_derniere_publication: new Date("2024-02-21T09:00:00.000Z"),
        date_premiere_activation: new Date("2024-02-21T09:00:00.000Z"),
        date_derniere_activation: new Date("2024-02-21T09:00:00.000Z"),
        source: "rncp",
        data: {
          ...mockSourceData,
          standard: {
            ...mockSourceData.standard,
            Numero_Fiche: "RNCP001",
            Actif: "ACTIVE",
          },
        },
      };

      const initialFicheInactive: ISourceFranceCompetence = {
        ...initialFicheActive,
        active: false,
        date_premiere_activation: null,
        date_derniere_activation: null,
        data: {
          ...initialFicheActive.data,
          standard: {
            ...mockSourceData.standard,
            Numero_Fiche: "RNCP001",
            Actif: "ACTIVE",
          },
        },
      };

      const activeStandardData: ISourceFcStandard = {
        ...mockSourceData.standard,
        Numero_Fiche: "RNCP001",
        Actif: "ACTIVE",
      };

      const inactiveStandardData: ISourceFcStandard = {
        ...mockSourceData.standard,
        Numero_Fiche: "RNCP001",
        Actif: "INACTIVE",
      };

      describe("when fiche current:active & older:active", () => {
        it("it should update fiche", async () => {
          await getDbCollection("source.france_competence").insertOne(initialFicheActive);

          const entry = mockEntry("export_fiches_CSV_Standard_2024_02_01.csv", [activeStandardData]);

          await importRncpFile(entry, { ...importMeta, archiveMeta: archiveMetaOlder });

          expect(await getDbCollection("source.france_competence").find({}).toArray()).toEqual([
            {
              ...initialFicheActive,
              updated_at: importMeta.import_date,
              date_premiere_publication: archiveMetaOlder.date_publication,
              date_premiere_activation: archiveMetaOlder.date_publication,
            },
          ]);
        });
      });

      describe("when fiche current:active -> older:inactive", () => {
        it("it should update fiche", async () => {
          await getDbCollection("source.france_competence").insertOne(initialFicheActive);

          const entry = mockEntry("export_fiches_CSV_Standard_2024_02_01.csv", [inactiveStandardData]);

          await importRncpFile(entry, { ...importMeta, archiveMeta: archiveMetaOlder });

          expect(await getDbCollection("source.france_competence").find({}).toArray()).toEqual([
            {
              ...initialFicheActive,
              updated_at: importMeta.import_date,
              date_premiere_publication: archiveMetaOlder.date_publication,
            },
          ]);
        });
      });

      describe("when fiche current:inactive -> older:active", () => {
        it("it should update fiche", async () => {
          await getDbCollection("source.france_competence").insertOne(initialFicheInactive);

          const entry = mockEntry("export_fiches_CSV_Standard_2024_02_01.csv", [activeStandardData]);

          await importRncpFile(entry, { ...importMeta, archiveMeta: archiveMetaOlder });

          expect(await getDbCollection("source.france_competence").find({}).toArray()).toEqual([
            {
              ...initialFicheInactive,
              updated_at: importMeta.import_date,
              date_premiere_publication: archiveMetaOlder.date_publication,
              date_premiere_activation: archiveMetaOlder.date_publication,
              date_derniere_activation: archiveMetaOlder.date_publication,
            },
          ]);
        });
      });

      describe("when fiche current:inactive -> older:inactive", () => {
        it("it should update fiche", async () => {
          await getDbCollection("source.france_competence").insertOne(initialFicheInactive);

          const entry = mockEntry("export_fiches_CSV_Standard_2024_02_01.csv", [inactiveStandardData]);

          await importRncpFile(entry, { ...importMeta, archiveMeta: archiveMetaOlder });

          expect(await getDbCollection("source.france_competence").find({}).toArray()).toEqual([
            {
              ...initialFicheInactive,
              updated_at: importMeta.import_date,
              date_premiere_publication: archiveMetaOlder.date_publication,
            },
          ]);
        });
      });
    });
  });

  describe.each<[Exclude<ISourceFranceCompetenceDataKey, "standard">, string]>([
    ["ccn", "export_fiches_CSV_CCN_2024_02_22.csv"],
    ["partenaires", "export_fiches_CSV_Partenaires_2024_02_22.csv"],
    ["blocs_de_competences", "export_fiches_CSV_Blocs_De_Compétences_2024_02_22.csv"],
    ["nsf", "export_fiches_CSV_Nsf_2024_02_22.csv"],
    ["formacode", "export_fiches_CSV_Formacode_2024_02_22.csv"],
    ["ancienne_nouvelle_certification", "export_fiches_CSV_Ancienne_Nouvelle_Certification_2024_02_22.csv"],
    ["voies_d_acces", "export_fiches_CSV_VoixdAccès_2024_02_22.csv"],
    ["rome", "export_fiches_CSV_Rome_2024_02_22.csv"],
    ["certificateurs", "export_fiches_CSV_Certificateurs_2024_02_22.csv"],
  ])("when file is %s", (source, filename) => {
    const archiveMeta = {
      date_publication: new Date("2024-02-21T23:00:00.000Z"),
      nom: "export-fiches-csv-2024-02-22.zip",
      last_updated: new Date("2024-02-22T03:02:07.320000+00:00"),
      resource: {
        created_at: new Date("2024-02-22T03:02:02.578000+00:00"),
        id: "f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
        last_modified: new Date("2024-02-22T03:02:07.320000+00:00"),
        latest: "https://www.data.gouv.fr/fr/datasets/r/0002",
        title: "export-fiches-csv-2024-02-22.zip",
      },
    };

    const importMeta = {
      import_date: new Date("2024-02-22T09:00:00.000Z"),
      type: "france_competence",
      _id: new ObjectId(),
      archiveMeta,
      status: "pending",
    } as const;

    describe("when fiche does not exist", () => {
      it("it should create fiche", async () => {
        const data = [...mockSourceData[source]];
        const entry = mockEntry(filename, data);

        await importRncpFile(entry, importMeta);

        expect(await getDbCollection("source.france_competence").find({}).toArray()).toEqual([
          {
            _id: expect.any(ObjectId),
            numero_fiche: "RNCP001",
            active: null,
            created_at: importMeta.import_date,
            updated_at: importMeta.import_date,
            date_premiere_publication: archiveMeta.date_publication,
            date_derniere_publication: archiveMeta.date_publication,
            date_premiere_activation: null,
            date_derniere_activation: null,
            source: "rncp",
            data: {
              ccn: [],
              partenaires: [],
              blocs_de_competences: [],
              nsf: [],
              formacode: [],
              ancienne_nouvelle_certification: [],
              voies_d_acces: [],
              rome: [],
              certificateurs: [],
              standard: null,
              [source]: data,
            },
          },
        ]);
      });
    });

    describe("when file is more recent", () => {
      const initialFiche: ISourceFranceCompetence = {
        _id: new ObjectId(),
        numero_fiche: "RNCP001",
        active: true,
        created_at: new Date("2024-02-21T09:00:00.000Z"),
        updated_at: new Date("2024-02-21T09:00:00.000Z"),
        date_premiere_publication: new Date("2024-02-21T09:00:00.000Z"),
        date_derniere_publication: new Date("2024-02-21T09:00:00.000Z"),
        date_premiere_activation: new Date("2024-02-21T09:00:00.000Z"),
        date_derniere_activation: new Date("2024-02-21T09:00:00.000Z"),
        source: "rncp",
        data: {
          ...mockSourceData,
          standard: {
            ...mockSourceData.standard,
            Numero_Fiche: "RNCP001",
            Actif: "ACTIVE",
          },
        },
      };

      it("it should update fiche", async () => {
        await getDbCollection("source.france_competence").insertOne(initialFiche);

        const data = [...mockSourceData2[source]];
        const entry = mockEntry(filename, data);

        await importRncpFile(entry, importMeta);

        expect(await getDbCollection("source.france_competence").find({}).toArray()).toEqual([
          {
            ...initialFiche,
            updated_at: importMeta.import_date,
            date_derniere_publication: archiveMeta.date_publication,
            data: {
              ccn: [],
              partenaires: [],
              blocs_de_competences: [],
              nsf: [],
              formacode: [],
              ancienne_nouvelle_certification: [],
              voies_d_acces: [],
              rome: [],
              certificateurs: [],
              standard: null,
              [source]: data,
            },
          },
        ]);
      });
    });

    describe("when file is from same archive", () => {
      it("should update fiche without removing other sources data", async () => {
        const initialFiche: ISourceFranceCompetence = {
          _id: new ObjectId(),
          numero_fiche: "RNCP001",
          active: true,
          created_at: importMeta.import_date,
          updated_at: importMeta.import_date,
          date_premiere_publication: archiveMeta.date_publication,
          date_derniere_publication: archiveMeta.date_publication,
          date_premiere_activation: archiveMeta.date_publication,
          date_derniere_activation: archiveMeta.date_publication,
          source: "rncp",
          data: {
            ...mockSourceData,
          },
        };

        await getDbCollection("source.france_competence").insertOne(initialFiche);

        const data = [...mockSourceData2[source]];
        const entry = mockEntry(filename, data);

        await importRncpFile(entry, importMeta);

        expect(await getDbCollection("source.france_competence").find({}).toArray()).toEqual([
          {
            ...initialFiche,
            updated_at: importMeta.import_date,
            active: true,
            date_derniere_publication: archiveMeta.date_publication,
            data: {
              ...initialFiche.data,
              [source]: [...initialFiche.data[source], ...data],
            },
          },
        ]);
      });
    });

    describe("when file is older", () => {
      const archiveMetaOlder = {
        date_publication: new Date("2024-02-01T00:00:00.000Z"),
        nom: "export-fiches-csv-2024-02-01.zip",
        last_updated: new Date("2024-02-01T03:02:07.320000+00:00"),
        resource: {
          created_at: new Date("2024-02-01T03:02:02.578000+00:00"),
          id: "f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
          last_modified: new Date("2024-02-01T03:02:07.320000+00:00"),
          latest: "https://www.data.gouv.fr/fr/datasets/r/0002",
          title: "export-fiches-csv-2024-02-01.zip",
        },
      };

      const initialFiche: ISourceFranceCompetence = {
        _id: new ObjectId(),
        numero_fiche: "RNCP001",
        active: true,
        created_at: new Date("2024-02-21T09:00:00.000Z"),
        updated_at: new Date("2024-02-21T09:00:00.000Z"),
        date_premiere_publication: new Date("2024-02-21T09:00:00.000Z"),
        date_derniere_publication: new Date("2024-02-21T09:00:00.000Z"),
        date_premiere_activation: new Date("2024-02-21T09:00:00.000Z"),
        date_derniere_activation: new Date("2024-02-21T09:00:00.000Z"),
        source: "rncp",
        data: {
          ccn: [
            {
              Numero_Fiche: "RNCP001",
              Ccn_1_Numero: null,
              Ccn_1_Libelle: null,
              Ccn_2_Numero: null,
              Ccn_2_Libelle: null,
              Ccn_3_Numero: null,
              Ccn_3_Libelle: null,
            },
          ],
          partenaires: [
            {
              Numero_Fiche: "RNCP001",
              Nom_Partenaire: null,
              Siret_Partenaire: null,
              Habilitation_Partenaire: null,
            },
          ],
          blocs_de_competences: [
            {
              Numero_Fiche: "RNCP001",
              Bloc_Competences_Code: "RNCP001BC1",
              Bloc_Competences_Libelle: null,
            },
          ],
          nsf: [
            {
              Numero_Fiche: "RNCP001",
              Nsf_Code: "123456",
              Nsf_Intitule: null,
            },
          ],
          formacode: [
            {
              Numero_Fiche: "RNCP001",
              Formacode_Code: "123456",
              Formacode_Libelle: "Intitulé Formacode",
            },
          ],
          ancienne_nouvelle_certification: [
            {
              Numero_Fiche: "RNCP001",
              Ancienne_Certification: null,
              Nouvelle_Certification: null,
            },
          ],
          voies_d_acces: [
            {
              Numero_Fiche: "RNCP001",
              Si_Jury: null,
            },
          ],
          rome: [
            {
              Numero_Fiche: "RNCP001",
              Codes_Rome_Code: "12345",
              Codes_Rome_Libelle: "Intitulé ROME",
            },
          ],
          certificateurs: [
            {
              Numero_Fiche: "RNCP001",
              Siret_Certificateur: "12345678901234",
              Nom_Certificateur: "Certificateur Test",
            },
          ],
          standard: {
            Id_Fiche: "Id_Fiche",
            Intitule: "Intitule",
            Abrege_Libelle: null,
            Abrege_Intitule: null,
            Nomenclature_Europe_Niveau: null,
            Nomenclature_Europe_Intitule: null,
            Accessible_Nouvelle_Caledonie: null,
            Accessible_Polynesie_Francaise: null,
            Date_dernier_jo: null,
            Date_Decision: null,
            Date_Fin_Enregistrement: null,
            Date_Effet: null,
            Type_Enregistrement: "Enregistrement de droit",
            Validation_Partielle: null,
            Numero_Fiche: "RNCP001",
            Actif: "ACTIVE",
          },
        },
      };

      it("it should update fiche", async () => {
        await getDbCollection("source.france_competence").insertOne(initialFiche);

        const data = [...mockSourceData2[source]];
        const entry = mockEntry(filename, data);

        await importRncpFile(entry, { ...importMeta, archiveMeta: archiveMetaOlder });

        expect(await getDbCollection("source.france_competence").find({}).toArray()).toEqual([
          {
            ...initialFiche,
            updated_at: importMeta.import_date,
            date_premiere_publication: archiveMetaOlder.date_publication,
          },
        ]);
      });
    });
  });
});

describe("importRncpArchive", () => {
  useMongo();

  beforeEach(() => {
    disableNetConnect();
  });

  afterEach(() => {
    cleanAll();
    enableNetConnect();
  });

  it("should import all files", async () => {
    const archiveMeta = {
      date_publication: new Date("2024-02-21T23:00:00.000Z"),
      last_updated: new Date("2024-02-22T03:02:07.320000+00:00"),
      nom: "export-fiches-csv-2024-02-22.zip",
      resource: {
        created_at: new Date("2024-02-22T03:02:02.578000+00:00"),
        id: "f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
        last_modified: new Date("2024-02-22T03:02:07.320000+00:00"),
        latest: "https://www.data.gouv.fr/fr/datasets/r/f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
        title: "export-fiches-csv-2024-02-22.zip",
      },
    } as const;

    const importMeta: IImportMetaFranceCompetence = {
      _id: new ObjectId(),
      import_date: new Date("2024-02-22T03:02:07.320000+00:00"),
      type: "france_competence",
      archiveMeta,
      status: "pending",
    };

    const dataFixture = join(
      dirname(fileURLToPath(import.meta.url)),
      "fixtures/sample/export-fiches-csv-2024-02-22.zip"
    );
    const s = createReadStream(dataFixture);

    nock("https://www.data.gouv.fr/fr").get(`/datasets/r/f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6`).reply(200, s);

    expect(await importRncpArchive(importMeta)).toEqual({
      total: 10,
      active: 2,
      created: 10,
      updated: 10,
      activated: 2,
      indicateurs: {
        continuity: { anciens: 0, nouveaux: 0 },
      },
    });

    const fiches = await getDbCollection("source.france_competence").find({}).toArray();

    fiches.forEach((fiche) => {
      expect(fiche).toMatchSnapshot({
        _id: expect.any(ObjectId),
      });
    });

    expect(addJob).toHaveBeenCalledTimes(1);
    expect(addJob).toHaveBeenCalledWith({ name: "indicateurs:source_kit_apprentissage:update" });
  });

  it("should fix continuity issues", async () => {
    const archiveMeta = {
      date_publication: new Date("2024-02-21T23:00:00.000Z"),
      last_updated: new Date("2024-02-22T03:02:07.320000+00:00"),
      nom: "export-fiches-csv-2024-02-22.zip",
      resource: {
        created_at: new Date("2024-02-22T03:02:02.578000+00:00"),
        id: "f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
        last_modified: new Date("2024-02-22T03:02:07.320000+00:00"),
        latest: "https://www.data.gouv.fr/fr/datasets/r/f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
        title: "export-fiches-csv-2024-02-22.zip",
      },
    } as const;

    const importMeta: IImportMetaFranceCompetence = {
      _id: new ObjectId(),
      import_date: new Date("2024-02-22T03:02:07.320000+00:00"),
      type: "france_competence",
      archiveMeta,
      status: "pending",
    };

    const dataFixture = join(
      dirname(fileURLToPath(import.meta.url)),
      "fixtures/continuity_fix/export-fiches-csv-2024-02-22.zip"
    );
    const s = createReadStream(dataFixture);

    nock("https://www.data.gouv.fr/fr").get(`/datasets/r/f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6`).reply(200, s);

    expect(await importRncpArchive(importMeta)).toEqual({
      total: 10,
      active: 2,
      created: 10,
      updated: 10,
      activated: 2,
      indicateurs: {
        continuity: { anciens: 1, nouveaux: 1 },
      },
    });

    const fiches = await getDbCollection("source.france_competence").find({}).toArray();

    fiches.forEach((fiche) => {
      expect(fiche).toMatchSnapshot({
        _id: expect.any(ObjectId),
      });
    });

    expect(addJob).toHaveBeenCalledTimes(1);
    expect(addJob).toHaveBeenCalledWith({ name: "indicateurs:source_kit_apprentissage:update" });
  });
});

describe("runRncpImporter", () => {
  useMongo();

  const now = new Date("2024-02-22T09:00:07.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(now);
    disableNetConnect();

    return () => {
      vi.mocked(fetchDataGouvDataSet).mockReset();
      vi.useRealTimers();
      cleanAll();
      enableNetConnect();
    };
  });

  const dataFixture = join(dirname(fileURLToPath(import.meta.url)), "fixtures/sample/export-fiches-csv-2024-02-22.zip");

  it("should schedule properly", async () => {
    const newResource = {
      created_at: new Date("2024-02-22T03:02:02.578000+00:00"),
      id: "f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
      last_modified: new Date("2024-02-22T03:02:07.320000+00:00"),
      latest: "https://www.data.gouv.fr/fr/datasets/r/f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6",
      title: "export-fiches-csv-2024-02-22.zip",
    };

    // Resource name doesn't match ==> should be ignored
    const ignoredResource = {
      created_at: new Date("2024-02-22T03:00:46.090000+00:00"),
      id: "06ffc0a9-8937-4f89-b724-b773495847b7",
      last_modified: new Date("2024-02-22T03:00:50.657000+00:00"),
      latest: "https://www.data.gouv.fr/fr/datasets/r/06ffc0a9-8937-4f89-b724-b773495847b7",
      title: "export-fiches-rs-v3-0-2024-02-22.zip",
    };

    const existingResource = {
      created_at: new Date("2024-02-21T03:02:04.366000+00:00"),
      id: "bc7f5072-c22f-4754-933f-cd8b91ebe81b",
      last_modified: new Date("2024-02-21T03:02:14.430000+00:00"),
      latest: "https://www.data.gouv.fr/fr/datasets/r/bc7f5072-c22f-4754-933f-cd8b91ebe81b",
      title: "export-fiches-csv-2024-02-21.zip",
    };

    const updatedResource = {
      created_at: new Date("2024-02-20T03:02:07.728000+00:00"),
      id: "35318a3e-57a9-44cb-8b14-195bf3ba90a4",
      last_modified: new Date("2024-02-22T03:02:12.137000+00:00"),
      latest: "https://www.data.gouv.fr/fr/datasets/r/35318a3e-57a9-44cb-8b14-195bf3ba90a4",
      title: "export-fiches-csv-2024-02-20.zip",
    };

    const dataset: IDataGouvDataset = {
      id: "5eebbc067a14b6fecc9c9976",
      title: "Répertoire national des certifications professionnelles et répertoire spécifique",
      resources: [newResource, ignoredResource, existingResource, updatedResource],
    };

    vi.mocked(fetchDataGouvDataSet).mockResolvedValue(dataset);

    nock("https://www.data.gouv.fr/fr")
      .get(`/datasets/r/f9ed431b-3a52-4ff2-b8c3-6f0a2c5cb3f6`)
      .reply(200, createReadStream(dataFixture));

    const initialImports: IImportMetaFranceCompetence[] = [
      {
        _id: new ObjectId(),
        import_date: new Date("2024-02-21T09:00:00.000Z"),
        type: "france_competence",
        archiveMeta: {
          date_publication: new Date("2024-02-21T00:00:00.000Z"),
          last_updated: existingResource.last_modified,
          nom: "export-fiches-csv-2024-02-21.zip",
          resource: existingResource,
        },
        status: "done",
      },
      {
        _id: new ObjectId(),
        import_date: new Date("2024-02-20T09:00:00.000Z"),
        type: "france_competence",
        archiveMeta: {
          date_publication: new Date("2024-02-19T23:00:00.000Z"),
          last_updated: new Date("2024-02-20T03:00:00.000Z"),
          nom: "export-fiches-csv-2024-02-20.zip",
          resource: { ...updatedResource, last_modified: new Date("2024-02-20T03:00:00.000Z") },
        },
        status: "done",
      },
    ];
    await getDbCollection("import.meta").insertMany(initialImports);

    const result = await runRncpImporter();

    expect(result).toEqual({
      count: 2,
      archives: [newResource.title, updatedResource.title],
    });
    expect(fetchDataGouvDataSet).toHaveBeenCalledWith("5eebbc067a14b6fecc9c9976");

    const newImportMeta = {
      _id: expect.any(ObjectId),
      import_date: now,
      type: "france_competence",
      archiveMeta: {
        date_publication: new Date("2024-02-21T23:00:00.000Z"),
        last_updated: newResource.last_modified,
        nom: newResource.title,
        resource: newResource,
      },
      status: "pending",
    };

    const updatedImportMeta = {
      _id: expect.any(ObjectId),
      import_date: now,
      type: "france_competence",
      archiveMeta: {
        date_publication: new Date("2024-02-19T23:00:00.000Z"),
        last_updated: updatedResource.last_modified,
        nom: "export-fiches-csv-2024-02-20.zip",
        resource: updatedResource,
      },
      status: "pending",
    };

    await expect(getDbCollection("import.meta").find({}).toArray()).resolves.toEqual([
      ...initialImports,
      newImportMeta,
      updatedImportMeta,
    ]);
    expect(addJob).toHaveBeenCalledTimes(2);
    expect(addJob).toHaveBeenNthCalledWith(1, {
      name: "import:france_competence:resource",
      payload: newImportMeta,
      queued: true,
    });
    expect(addJob).toHaveBeenNthCalledWith(2, {
      name: "import:france_competence:resource",
      payload: updatedImportMeta,
      queued: true,
    });
  });
});

describe("onImportRncpArchiveFailure", () => {
  useMongo();

  it("should update failed import meta", async () => {
    const existingResource = {
      created_at: new Date("2024-02-21T03:02:04.366000+00:00"),
      id: "bc7f5072-c22f-4754-933f-cd8b91ebe81b",
      last_modified: new Date("2024-02-21T03:02:14.430000+00:00"),
      latest: "https://www.data.gouv.fr/fr/datasets/r/bc7f5072-c22f-4754-933f-cd8b91ebe81b",
      title: "export-fiches-csv-2024-02-21.zip",
    };

    const failedResource = {
      created_at: new Date("2024-02-20T03:02:07.728000+00:00"),
      id: "35318a3e-57a9-44cb-8b14-195bf3ba90a4",
      last_modified: new Date("2024-02-22T03:02:12.137000+00:00"),
      latest: "https://www.data.gouv.fr/fr/datasets/r/35318a3e-57a9-44cb-8b14-195bf3ba90a4",
      title: "export-fiches-csv-2024-02-20.zip",
    };

    const initialImports: IImportMetaFranceCompetence[] = [
      {
        _id: new ObjectId(),
        import_date: new Date("2024-02-21T09:00:00.000Z"),
        type: "france_competence",
        archiveMeta: {
          date_publication: new Date("2024-02-21T00:00:00.000Z"),
          last_updated: existingResource.last_modified,
          nom: "export-fiches-csv-2024-02-21.zip",
          resource: existingResource,
        },
        status: "done",
      },
      {
        _id: new ObjectId(),
        import_date: new Date("2024-02-20T09:00:00.000Z"),
        type: "france_competence",
        archiveMeta: {
          date_publication: new Date("2024-02-19T23:00:00.000Z"),
          last_updated: failedResource.last_modified,
          nom: "export-fiches-csv-2024-02-20.zip",
          resource: failedResource,
        },
        status: "pending",
      },
    ];

    await getDbCollection("import.meta").insertMany(initialImports);

    await onImportRncpArchiveFailure(initialImports[1]);

    await expect(getDbCollection("import.meta").find({}).toArray()).resolves.toEqual([
      initialImports[0],
      {
        ...initialImports[1],
        status: "failed",
      },
    ]);
  });
});
