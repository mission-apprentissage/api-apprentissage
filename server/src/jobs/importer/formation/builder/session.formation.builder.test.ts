import { describe, expect, it } from "vitest";

import { buildFormationSessions } from "./session.formation.builder.js";

describe("buildFormationSession", () => {
  const source = {
    date_debut: ["2022-09-01T00:00:00.000Z", "2023-09-11T00:00:00.000Z", "2024-09-02T00:00:00.000Z"],
    date_fin: ["2024-07-09T00:00:00.000Z", "2025-07-07T00:00:00.000Z", "2026-07-10T00:00:00.000Z"],
    capacite: "10",
  };
  const expected = [
    {
      capacite: 10,
      debut: new Date(source.date_debut[0]),
      fin: new Date(source.date_fin[0]),
    },
    {
      capacite: 10,
      debut: new Date(source.date_debut[1]),
      fin: new Date(source.date_fin[1]),
    },
    {
      capacite: 10,
      debut: new Date(source.date_debut[2]),
      fin: new Date(source.date_fin[2]),
    },
  ];

  it("should build session", () => {
    const result = buildFormationSessions(source, {
      annee_cycle: 1,
      duree_indicative: 2,
    });

    expect(result).toEqual(expected);
  });

  it('should build session with "capacite" as null', () => {
    const result = buildFormationSessions(
      {
        ...source,
        capacite: null,
      },
      {
        annee_cycle: 1,
        duree_indicative: 2,
      }
    );

    expect(result).toEqual(expected.map((session) => ({ ...session, capacite: null })));
  });

  it('should return empty array if "date_debut" is empty', () => {
    const result = buildFormationSessions(
      {
        ...source,
        date_debut: [],
      },
      {
        annee_cycle: 1,
        duree_indicative: 2,
      }
    );

    expect(result).toEqual([]);
  });

  it('should return empty array if "date_fin" is empty', () => {
    const result = buildFormationSessions(
      {
        ...source,
        date_fin: [],
      },
      {
        annee_cycle: 1,
        duree_indicative: 2,
      }
    );

    expect(result).toEqual([]);
  });

  it('should support unordered "date_debut"', () => {
    const result = buildFormationSessions(
      {
        ...source,
        date_debut: source.date_debut.toReversed(),
      },
      {
        annee_cycle: 1,
        duree_indicative: 2,
      }
    );

    expect(result).toEqual(expected);
  });

  it('should support unordered "date_fin"', () => {
    const result = buildFormationSessions(
      {
        ...source,
        date_fin: source.date_fin.toReversed(),
      },
      {
        annee_cycle: 1,
        duree_indicative: 2,
      }
    );

    expect(result).toEqual(expected);
  });

  it("should support dateDebuts.length > dateFins.length", () => {
    const result = buildFormationSessions(
      {
        ...source,
        date_debut: [...source.date_debut, "2025-09-02T00:00:00.000Z"].toReversed(),
      },
      {
        annee_cycle: 1,
        duree_indicative: 2,
      }
    );

    expect(result).toEqual(expected);
  });

  it("should support dateDebuts.length < dateFins.length", () => {
    const result = buildFormationSessions(
      {
        ...source,
        date_fin: [...source.date_fin, "2026-07-10T00:00:00.000Z"].toReversed(),
      },
      {
        annee_cycle: 1,
        duree_indicative: 2,
      }
    );

    expect(result).toEqual(expected);
  });
});
