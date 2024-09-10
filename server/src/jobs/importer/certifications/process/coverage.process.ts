import { internal } from "@hapi/boom";
import { ObjectId } from "mongodb";
import { substractIntervals } from "shared";
import type { ICertificationInternal } from "shared/models/certification.model";
import type { IImportMetaCertifications } from "shared/models/import.meta.model";
import type { IBcn_N_FormationDiplome } from "shared/models/source/bcn/bcn.n_formation_diplome.model";
import type { IBcn_N51_FormationDiplome } from "shared/models/source/bcn/bcn.n51_formation_diplome.model";
import type { ISourceFranceCompetence } from "shared/models/source/france_competence/source.france_competence.model";
import { Transform } from "stream";
import { pipeline } from "stream/promises";

import { buildCertification } from "@/jobs/importer/certifications/builder/certification.builder.js";
import { withCause } from "@/services/errors/withCause.js";
import { getDbCollection } from "@/services/mongodb/mongodbService.js";

type ChunkCfd = {
  _id: string;
  certifications: ICertificationInternal[];
  bcn: IBcn_N51_FormationDiplome | IBcn_N_FormationDiplome;
};

type ChunkRncp = {
  _id: string;
  certifications: ICertificationInternal[];
  france_competence: ISourceFranceCompetence;
};

export function buildMissingCfdCertification(
  chunk: ChunkCfd,
  importMeta: IImportMetaCertifications
): ICertificationInternal[] {
  const missingIntervals = substractIntervals(
    [
      {
        start: chunk.certifications[0].periode_validite.cfd!.ouverture,
        end: chunk.certifications[0].periode_validite.cfd!.fermeture,
      },
    ],
    chunk.certifications.map((c) => ({
      start: c.periode_validite.debut,
      end: c.periode_validite.fin,
    }))
  );

  return missingIntervals.map((interval): ICertificationInternal => {
    const c = buildCertification(
      { bcn: chunk.bcn, france_competence: null },
      importMeta.source.france_competence.oldest_date_publication
    );

    return {
      ...c,
      periode_validite: {
        ...c.periode_validite,
        debut: interval.start,
        fin: interval.end,
      },
      _id: new ObjectId(),
      created_at: importMeta.import_date,
      updated_at: importMeta.import_date,
    };
  });
}

export function buildMissingRncpCertification(
  chunk: ChunkRncp,
  importMeta: IImportMetaCertifications
): ICertificationInternal[] {
  const missingIntervals = substractIntervals(
    [
      {
        start: chunk.certifications[0].periode_validite.rncp!.activation,
        end: chunk.certifications[0].periode_validite.rncp!.fin_enregistrement,
      },
    ],
    chunk.certifications.map((c) => ({
      start: c.periode_validite.debut,
      end: c.periode_validite.fin,
    }))
  );

  return missingIntervals.map((interval): ICertificationInternal => {
    const c = buildCertification(
      { bcn: null, france_competence: chunk.france_competence },
      importMeta.source.france_competence.oldest_date_publication
    );

    return {
      ...c,
      periode_validite: {
        ...c.periode_validite,
        debut: interval.start,
        fin: interval.end,
      },
      _id: new ObjectId(),
      created_at: importMeta.import_date,
      updated_at: importMeta.import_date,
    };
  });
}

function createMapperStream<C>(mapper: (c: C) => ICertificationInternal[], type: "cfd" | "rncp") {
  return new Transform({
    objectMode: true,
    async transform(chunk: C, _encoding, callback) {
      try {
        const op = mapper(chunk);
        callback(null, op);
      } catch (error) {
        callback(
          withCause(internal("import.certifications: error processing certification coverage", { type }), error)
        );
      }
    },
  });
}

function createInsertStream(type: "cfd" | "rncp") {
  return new Transform({
    objectMode: true,
    async transform(chunk: ICertificationInternal[], _encoding, callback) {
      try {
        if (chunk.length > 0) {
          await getDbCollection("certifications").insertMany(chunk);
        }
        callback();
      } catch (error) {
        callback(withCause(internal("import.certifications: error inserting certification coverage", { type }), error));
      }
    },
  });
}

async function processCfdCertificationCoverage(importMeta: IImportMetaCertifications) {
  await pipeline(
    getDbCollection("certifications").aggregate<ChunkCfd>([
      {
        $match: {
          "identifiant.cfd": { $ne: null },
          // We can ignore cfd not associated to RNCP because the validity period will always match CFD one
          "identifiant.rncp": { $ne: null },
          updated_at: importMeta.import_date,
        },
      },
      {
        $group: {
          _id: "$identifiant.cfd",
          certifications: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $lookup: {
          from: "source.bcn",
          localField: "_id",
          foreignField: "data.FORMATION_DIPLOME",
          as: "bcn",
          pipeline: [{ $match: { source: { $in: ["N_FORMATION_DIPLOME", "N_FORMATION_DIPLOME_ENQUETE_51"] } } }],
        },
      },
      {
        $unwind: {
          path: "$bcn",
        },
      },
    ]),
    createMapperStream<ChunkCfd>((chunk) => buildMissingCfdCertification(chunk, importMeta), "cfd"),
    createInsertStream("cfd")
  );
}

async function processRncpCertificationCoverage(importMeta: IImportMetaCertifications) {
  await pipeline(
    getDbCollection("certifications").aggregate<ChunkRncp>([
      {
        $match: {
          // We can ignore cfd not associated to CFD because the validity period will always match CFD one
          "identifiant.cfd": { $ne: null },
          "identifiant.rncp": { $ne: null },
          updated_at: importMeta.import_date,
        },
      },
      {
        $group: {
          _id: "$identifiant.rncp",
          certifications: {
            $push: "$$ROOT",
          },
        },
      },
      {
        $lookup: {
          from: "source.france_competence",
          localField: "_id",
          foreignField: "numero_fiche",
          as: "france_competence",
        },
      },
      {
        $unwind: {
          path: "$france_competence",
        },
      },
    ]),
    createMapperStream<ChunkRncp>((chunk) => buildMissingRncpCertification(chunk, importMeta), "rncp"),
    createInsertStream("rncp")
  );
}

// Make sure every CFD & RNCP have a matching certification for his entire validity period
export async function processCertificationCoverage(importMeta: IImportMetaCertifications) {
  await processCfdCertificationCoverage(importMeta);
  await processRncpCertificationCoverage(importMeta);
}
