import { internal } from "@hapi/boom";
import type { IFormation } from "api-alternance-sdk";
import { ParisDate } from "api-alternance-sdk/internal";
import { Interval } from "luxon";
import type { IFormationCatalogue } from "shared/models/source/catalogue/source.catalogue.model";

type IModaliteData = Pick<IFormation["modalite"], "annee_cycle" | "duree_indicative">;

function getBestMatchSession(sessions: { debut: ParisDate; fin: ParisDate }[], modalite: IModaliteData) {
  let bestMatch = null;
  let bestMatchScore = 0;

  const annee_cycle = modalite.annee_cycle ?? 1;
  const expectedDuration = modalite.duree_indicative - annee_cycle + 1;

  for (const session of sessions) {
    const interval = Interval.fromDateTimes(session.debut, session.fin);
    if (!interval.isValid) {
      continue;
    }
    const duration = interval.toDuration(["years"]).years;
    const score = Math.abs(expectedDuration - duration);

    if (bestMatch === null || score < bestMatchScore) {
      bestMatch = session;
      bestMatchScore = score;
    }
  }

  if (bestMatch === null) {
    throw internal(`getBestMatchSession: no best match found`);
  }

  return bestMatch;
}

export function buildFormationSessions(
  data: Pick<IFormationCatalogue, "date_debut" | "date_fin" | "capacite">,
  modalite: IModaliteData
): IFormation["sessions"] {
  const dateDebuts = data.date_debut?.toSorted() ?? [];
  const dateFins = data.date_fin?.toSorted() ?? [];

  const sessions: IFormation["sessions"] = [];

  if (dateDebuts.length === 0 || dateFins.length === 0) {
    return sessions;
  }

  if (dateDebuts.length === dateFins.length) {
    for (let i = 0; i < dateDebuts.length; i++) {
      sessions.push({
        debut: new ParisDate(dateDebuts[i]),
        fin: new ParisDate(dateFins[i]),
        capacite: data.capacite == null ? null : Number(data.capacite),
      });
    }
  }

  if (dateDebuts.length > dateFins.length) {
    for (let i = 0; i < dateFins.length; i++) {
      const fin = new ParisDate(dateFins[i]);

      const bestMatch = getBestMatchSession(
        dateDebuts.map((dateDebut) => ({
          debut: new ParisDate(dateDebut),
          fin,
        })),
        modalite
      );

      sessions.push({
        ...bestMatch,
        capacite: data.capacite == null ? null : Number(data.capacite),
      });
    }
  }

  if (dateDebuts.length < dateFins.length) {
    for (let i = 0; i < dateDebuts.length; i++) {
      const debut = new ParisDate(dateDebuts[i]);

      const bestMatch = getBestMatchSession(
        dateFins.map((dateFin) => ({
          debut,
          fin: new ParisDate(dateFin),
        })),
        modalite
      );

      sessions.push({
        ...bestMatch,
        capacite: data.capacite == null ? null : Number(data.capacite),
      });
    }
  }

  return sessions;
}
