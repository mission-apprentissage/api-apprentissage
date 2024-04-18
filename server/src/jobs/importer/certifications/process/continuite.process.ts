import { AnyBulkWriteOperation } from "mongodb";
import { ICertification } from "shared/models/certification.model";
import { IImportMetaCertifications } from "shared/models/import.meta.model";
import { IBcn_N_FormationDiplome } from "shared/models/source/bcn/bcn.n_formation_diplome.model";

import { getDbCollection } from "../../../../services/mongodb/mongodbService";
import {
  buildCertificationSearchMap,
  ICertificationSearchMap,
} from "../builder/periode_validite/certification.periode_validite.builder";

function addToGroupMap(groupMap: Map<string, Set<string>>, codes: string[]) {
  for (const code of codes) {
    if (!groupMap.has(code)) {
      groupMap.set(code, new Set(codes));
    } else {
      for (const otherCode of codes) {
        groupMap.get(code)!.add(otherCode);
      }
    }
  }
}

async function buildCfdContinuiteGroups() {
  const cursor = getDbCollection("source.bcn").find<IBcn_N_FormationDiplome>({
    source: "N_FORMATION_DIPLOME",
  });

  const groupMap = new Map<string, Set<string>>();

  for await (const doc of cursor) {
    const data = doc.data;
    addToGroupMap(groupMap, [data.FORMATION_DIPLOME, ...data.ANCIEN_DIPLOMES, ...data.NOUVEAU_DIPLOMES]);
  }

  const groups: string[][] = [];
  const seen: Set<string> = new Set();

  for (const [code, group] of groupMap) {
    if (seen.has(code)) continue;

    const codes = Array.from(group);
    codes.forEach((c) => seen.add(c));
    groups.push(codes);
  }

  return groups;
}

async function buildRncpContinuiteGroups() {
  const cursor = getDbCollection("source.france_competence").find();

  const groupMap = new Map<string, Set<string>>();

  for await (const doc of cursor) {
    const fiches = doc.data.ancienne_nouvelle_certification.flatMap(
      ({ Ancienne_Certification, Nouvelle_Certification }) => {
        const result = [];

        if (Ancienne_Certification !== null) {
          result.push(Ancienne_Certification);
        }

        if (Nouvelle_Certification !== null) {
          result.push(Nouvelle_Certification);
        }

        return result;
      }
    );
    addToGroupMap(groupMap, [...fiches, doc.numero_fiche]);
  }

  const groups: string[][] = [];
  const seen: Set<string> = new Set();

  for (const [code, group] of groupMap) {
    if (seen.has(code)) continue;

    const codes = Array.from(group);
    codes.forEach((c) => seen.add(c));
    groups.push(codes);
  }

  return groups;
}

function compareDate(a: Date | null, b: Date | null) {
  if (a === null && b === null) {
    return 0;
  }

  if (a === null) {
    return 1;
  }

  if (b === null) {
    return -1;
  }

  return a.getTime() - b.getTime();
}

async function processCfdContinuiteGroup(searchMap: ICertificationSearchMap, group: string[]) {
  const ops: AnyBulkWriteOperation<ICertification>[] = [];

  const continuite = group
    .map((code) => ({
      code,
      ouverture: searchMap.cfd[code]?.ouverture ?? null,
      fermeture: searchMap.cfd[code]?.fermeture ?? null,
      courant: false,
    }))
    .toSorted((a, b) => compareDate(a.ouverture, b.ouverture));

  for (const code of group) {
    ops.push({
      updateMany: {
        filter: { "identifiant.cfd": code },
        update: {
          $set: {
            "continuite.cfd": continuite.map((c) => ({ ...c, courant: c.code === code })),
          },
        },
      },
    });
  }

  await getDbCollection("certifications").bulkWrite(ops, { ordered: false });
}

async function processRncpContinuiteGroup(searchMap: ICertificationSearchMap, group: string[]) {
  const ops: AnyBulkWriteOperation<ICertification>[] = [];

  const continuite = group
    .map((code) => ({
      code,
      activation: searchMap.rncp[code]?.activation ?? null,
      fin_enregistrement: searchMap.rncp[code]?.fin_enregistrement ?? null,
      courant: false,
    }))
    .toSorted((a, b) => compareDate(a.activation, b.activation));

  for (const code of group) {
    ops.push({
      updateMany: {
        filter: { "identifiant.rncp": code },
        update: {
          $set: {
            "continuite.rncp": continuite.map((c) => ({ ...c, courant: c.code === code })),
          },
        },
      },
    });
  }

  await getDbCollection("certifications").bulkWrite(ops, { ordered: false });
}

export async function processContinuite(importMeta: IImportMetaCertifications) {
  const searchMap = await buildCertificationSearchMap(importMeta.source.france_competence.oldest_date_publication);

  const cfdContinuiteGroups = await buildCfdContinuiteGroups();
  for (const group of cfdContinuiteGroups) {
    await processCfdContinuiteGroup(searchMap, group);
  }

  const rncpContinuiteGroups = await buildRncpContinuiteGroups();
  for (const group of rncpContinuiteGroups) {
    await processRncpContinuiteGroup(searchMap, group);
  }
}
