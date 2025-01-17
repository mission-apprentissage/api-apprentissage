import { config } from "dotenv";
import { MongoClient } from "mongodb";

export default async () => {
  return async () => {
    config({ path: "./server/.env.test" });

    const uri = process.env.MONGODB_URI?.replace("VITEST_POOL_ID", "") ?? "";
    const client = new MongoClient(uri, {
      connectTimeoutMS: 10_000,
      socketTimeoutMS: 10_000,
      serverSelectionTimeoutMS: 10_000,
    });
    try {
      if (process.env.CI) {
        return;
      }

      await client.connect();
      const dbs = await client.db().admin().listDatabases();
      await Promise.all(
        dbs.databases.map(async (db) => {
          if (db.name.startsWith("api-test-")) {
            return client.db(db.name).dropDatabase();
          }

          return;
        })
      );
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
    }
  };
};
