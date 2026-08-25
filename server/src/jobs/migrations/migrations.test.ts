import { fileURLToPath } from "node:url"
import { useMongo } from "@tests/mongo.test.utils.js"
import path from "path"
import { describe, expect, it } from "vitest"

import { getDatabase } from "@/services/mongodb/mongodbService.js"

import { status } from "./migrations.js"

const fixturesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "./fixtures")

const APPLIED_REQUIRE_SHUTDOWN = "20230101000000-applied-require-shutdown.js"
const PENDING_NO_SHUTDOWN = "20240101000000-pending-no-shutdown.js"
const PENDING_REQUIRE_SHUTDOWN = "20240201000000-pending-require-shutdown.js"
const PENDING_DEFAULT_SHUTDOWN = "20240301000000-pending-default-shutdown.js"

async function markAsApplied(fileNames: string[]) {
  await getDatabase()
    .collection("migrations")
    .insertMany(fileNames.map((fileName) => ({ fileName, appliedAt: new Date() })))
}

useMongo()

describe("status", () => {
  it("ne demande pas le shutdown quand aucune migration en attente ne le requiert (explicite ou par défaut)", async () => {
    await markAsApplied([APPLIED_REQUIRE_SHUTDOWN, PENDING_REQUIRE_SHUTDOWN])

    const result = await status(fixturesDir)

    expect(result).toEqual({ count: 2, requireShutdown: false })
  })

  it("demande le shutdown quand une migration en attente le requiert", async () => {
    await markAsApplied([APPLIED_REQUIRE_SHUTDOWN])

    const result = await status(fixturesDir)

    expect(result).toEqual({ count: 3, requireShutdown: true })
  })

  it("ne demande pas le shutdown quand toutes les migrations sont appliquées", async () => {
    await markAsApplied([APPLIED_REQUIRE_SHUTDOWN, PENDING_NO_SHUTDOWN, PENDING_REQUIRE_SHUTDOWN, PENDING_DEFAULT_SHUTDOWN])

    const result = await status(fixturesDir)

    expect(result).toEqual({ count: 0, requireShutdown: false })
  })
})
