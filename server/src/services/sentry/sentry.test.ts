import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { badRequest, internal, notFound } from "@hapi/boom"
import { createGetModuleFromFilename } from "@sentry/node"
import { build } from "tsup"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { getOptions, normalizeBundleChunkModule, shouldHandleFastifyError } from "./sentry.js"

describe("shouldHandleFastifyError", () => {
  // Le canal de diagnostic fastify remonte l'erreur avant que le statut ne soit posé sur la
  // réponse : `replyStatusCode` vaut donc encore 200 dans tous ces cas.
  const replyStatusCodeBeforeErrorHandler = 200

  it("should capture boom server errors", () => {
    expect(shouldHandleFastifyError(internal("boom"), replyStatusCodeBeforeErrorHandler)).toBe(true)
  })

  it.each([[notFound("Aucune formation trouvée")], [badRequest("Request validation failed")]])("should not capture boom client error %#", (error) => {
    expect(shouldHandleFastifyError(error, replyStatusCodeBeforeErrorHandler)).toBe(false)
  })

  it("should not capture fastify errors carrying a client status code", () => {
    expect(shouldHandleFastifyError(Object.assign(new Error("bad request"), { statusCode: 400 }), replyStatusCodeBeforeErrorHandler)).toBe(false)
  })

  it("should capture errors without any status code", () => {
    expect(shouldHandleFastifyError(new Error("boom"), replyStatusCodeBeforeErrorHandler)).toBe(true)
  })
})

describe("normalizeBundleChunkModule", () => {
  // Build réel avec les options de `server/tsup.config.ts` qui déterminent le nommage des fichiers,
  // pour obtenir les `module` que calcule le SDK en production.
  async function buildModules(root: string, mainBody: string): Promise<string[]> {
    const srcDir = join(root, "src")
    const outDir = join(root, "dist")
    await mkdir(join(srcDir, "migrations"), { recursive: true })
    await writeFile(join(srcDir, "shared.ts"), "export const shared = () => 'shared'\n")
    await writeFile(join(srcDir, "main.ts"), `import { shared } from "./shared.js"\nexport const main = () => shared() + ${JSON.stringify(mainBody)}\n`)
    await writeFile(join(srcDir, "index.ts"), "const { main } = await import('./main.js')\nconsole.log(main())\n")
    await writeFile(join(srcDir, "migrations", "20240101000000-init.ts"), "import { shared } from '../shared.js'\nexport const up = shared\n")

    await build({
      config: false,
      silent: true,
      entry: { index: join(srcDir, "index.ts"), "migrations/20240101000000-init": join(srcDir, "migrations", "20240101000000-init.ts") },
      outDir,
      target: "es2022",
      platform: "node",
      format: ["esm"],
      splitting: true,
      clean: true,
      // tsup déduit `.js` du `"type": "module"` de `server/package.json` ; le dossier de build
      // temporaire n'en a pas.
      outExtension: () => ({ js: ".js" }),
    })

    const getModule = createGetModuleFromFilename(outDir)
    const files = await readdir(outDir, { recursive: true })

    return files
      .filter((file) => file.endsWith(".js"))
      .map((file) => getModule(join(outDir, file)) ?? file)
      .toSorted()
  }

  let root: string
  let firstBuild: string[]
  let secondBuild: string[]

  beforeAll(async () => {
    root = await mkdtemp(join(tmpdir(), "sentry-chunk-"))
    firstBuild = await buildModules(join(root, "a"), "v1")
    secondBuild = await buildModules(join(root, "b"), "v2")
  })

  afterAll(async () => {
    await rm(root, { recursive: true, force: true })
  })

  it("should derive build-dependent modules from esbuild chunk names", () => {
    expect(firstBuild).not.toEqual(secondBuild)
    expect(firstBuild.filter((module) => module.startsWith("main-"))).toHaveLength(1)
  })

  it("should give the same modules to two builds of different contents", () => {
    const normalize = (modules: string[]) => modules.map((module) => normalizeBundleChunkModule({ module }).module)

    expect(normalize(firstBuild)).toEqual(normalize(secondBuild))
    expect(normalize(firstBuild)).toEqual(expect.arrayContaining(["index", "main", "chunk", "migrations:20240101000000-init"]))
  })

  it.each([
    ["a node_modules module", "job-processor.dist:index"],
    ["a node_modules module ending like a hash", "some-lib.dist:file-ABCDEFGH"],
    ["a build sub-directory module", "migrations:20240924074628-utf-8-validation"],
    ["a module without hash", "index"],
    ["a dated suffix outside of the base32 alphabet", "export-20240924"],
    ["a lowercase suffix", "main-abcdefgh"],
  ])("should keep %s untouched", (_label, module) => {
    expect(normalizeBundleChunkModule({ module }).module).toBe(module)
  })

  it("should keep a frame without module untouched", () => {
    const frame = { filename: "node:internal/process/task_queues", function: "processTicksAndRejections" }

    expect(normalizeBundleChunkModule(frame)).toBe(frame)
  })

  it("should only rewrite the module of exception frames with the integration passed to Sentry.init", () => {
    const integrations = getOptions().integrations
    const rewriteFrames = Array.isArray(integrations) ? integrations.find((i) => i.name === "RewriteFrames") : undefined
    const frame = { filename: "/app/server/dist/main-QT4XI7V2.js", module: "main-QT4XI7V2", function: "scrapeRessourceCcn", lineno: 1, colno: 1 }

    const event = rewriteFrames?.processEvent?.({ exception: { values: [{ type: "Error", stacktrace: { frames: [frame] } }] } }, {}, {} as never)

    expect(event).toMatchObject({
      exception: { values: [{ stacktrace: { frames: [{ ...frame, module: "main" }] } }] },
    })
  })
})
