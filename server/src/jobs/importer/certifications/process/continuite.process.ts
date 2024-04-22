import { AnyBulkWriteOperation } from "mongodb";
import { ICertification } from "shared/models/certification.model";
import { IImportMetaCertifications } from "shared/models/import.meta.model";
import { IBcn_N_FormationDiplome } from "shared/models/source/bcn/bcn.n_formation_diplome.model";

import { getDbCollection } from "../../../../services/mongodb/mongodbService";
import {
  buildCertificationSearchMap,
  ICertificationSearchMap,
} from "../builder/periode_validite/certification.periode_validite.builder";

type GroupContext = {
  groups: Map<string, Set<string>>;
  codeToGroup: Map<string, string>;
};

function addToGroupMap(context: GroupContext, codes: string[]) {
  const groupCodes = new Set(
    codes.filter((code) => context.codeToGroup.has(code)).map((code) => context.codeToGroup.get(code)!)
  );

  // No groups created for any of the codes
  if (groupCodes.size === 0) {
    context.groups.set(codes[0], new Set(codes));
    codes.forEach((code) => context.codeToGroup.set(code, codes[0]));
    return;
  }

  const [mainGroupCode, ...otherGroupsCodes] = Array.from(groupCodes);

  // Multiple groups created for multiple codes, we need to merge groups
  if (otherGroupsCodes.length > 0) {
    for (const groupCode of otherGroupsCodes) {
      context.groups.get(groupCode)!.forEach((code) => {
        context.groups.get(mainGroupCode)!.add(code);
        context.codeToGroup.set(code, mainGroupCode);
      });
      context.groups.delete(groupCode);
    }
  }

  // Only one group created for one of the codes
  codes.forEach((code) => {
    context.groups.get(mainGroupCode)!.add(code);
    context.codeToGroup.set(code, mainGroupCode);
  });
}

async function buildCfdContinuiteGroups() {
  const cursor = getDbCollection("source.bcn").find<IBcn_N_FormationDiplome>({
    source: "N_FORMATION_DIPLOME",
  });

  const context: GroupContext = {
    groups: new Map(),
    codeToGroup: new Map(),
  };

  for await (const doc of cursor) {
    const data = doc.data;
    addToGroupMap(context, [data.FORMATION_DIPLOME, ...data.ANCIEN_DIPLOMES, ...data.NOUVEAU_DIPLOMES]);
  }

  const groups: string[][] = [];

  for (const [, group] of context.groups) {
    const codes = Array.from(group);
    groups.push(codes);
  }

  return groups;
}

async function buildRncpContinuiteGroups() {
  const cursor = getDbCollection("source.france_competence").find();

  const context: GroupContext = {
    groups: new Map(),
    codeToGroup: new Map(),
  };

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
    addToGroupMap(context, [...fiches, doc.numero_fiche]);
  }

  const groups: string[][] = [];

  for (const [, group] of context.groups) {
    const codes = Array.from(group);
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
    // Filter out not found codes)
    .filter((code) => searchMap.cfd[code] != null)
    .map((code) => ({
      code,
      ouverture: searchMap.cfd[code]!.ouverture ?? null,
      fermeture: searchMap.cfd[code]!.fermeture ?? null,
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
    // Filter out not found codes)
    .filter((code) => searchMap.rncp[code] != null)
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
