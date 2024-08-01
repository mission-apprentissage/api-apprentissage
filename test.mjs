import { readFile, writeFile } from "fs/promises";
import { MongoClient } from "mongodb";

const output = JSON.parse(await readFile("./output.json", "utf-8"));

const client = await MongoClient.connect(process.env.MONGO_URI);
console.log("Connected to MongoDB");
const organismeColl = client.db("flux-retour-cfas").collection("organismes");
const organisationColl = client.db("flux-retour-cfas").collection("organisations");

const getStats = async ({ siret, uai }) => {
  const [organisme, organisations] = await Promise.all([
    organismeColl.findOne({ siret, uai }),
    organisationColl
      .aggregate([
        { $match: { siret, uai } },
        {
          $lookup: {
            from: "usersMigration",
            localField: "_id",
            foreignField: "organisation_id",
            as: "users",
          },
        },
      ])
      .toArray(),
  ]);

  return {
    siret,
    uai,
    users: organisations.length === 0 ? null : organisations[0].users.length,
    effectifs_current_year_count: organisme?.effectifs_current_year_count ?? null,
    effectifs_count: organisme?.effectifs_count ?? null,
    first_transmission_date: organisme?.first_transmission_date ?? null,
    last_transmission_date: organisme?.last_transmission_date ?? null,
    enseigne: organisme?.enseigne ?? null,
  };
};

const stats = { fauxNegatifs: [], fauxPositifs: [], inconsistency: [] };
let fauxNegatifs = 0;
for (const o of output.fauxNegatifs) {
  const [input, expected] = await Promise.all([getStats(o), getStats({ siret: o.expectedSiret, uai: o.expectedUai })]);
  stats.fauxNegatifs.push({
    input,
    expected,
  });
  console.log(fauxNegatifs++);
}
let fauxPositifs = 0;
for (const o of output.fauxPositifs) {
  const [input, newResult] = await Promise.all([getStats(o), getStats({ siret: o.resultSiret, uai: o.resultUai })]);
  stats.fauxPositifs.push({ input, newResult });
  console.log(fauxPositifs++);
}
let inconsistency = 0;
for (const o of output.inconsistency) {
  const [input, expected, newResult] = await Promise.all([
    getStats(o),
    getStats({ siret: o.expectedSiret, uai: o.expectedUai }),
    getStats({ siret: o.resultSiret, uai: o.resultUai }),
  ]);
  stats.inconsistency.push({
    input,
    newResult,
    expected,
  });
  console.log(inconsistency++);
}

await writeFile("./impacts.json", JSON.stringify(stats, null, 2), "utf-8");

await client.close();
