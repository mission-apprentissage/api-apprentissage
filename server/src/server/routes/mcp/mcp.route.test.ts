import { useMongo } from "@tests/mongo.test.utils.js"
import nock, { cleanAll, disableNetConnect, enableNetConnect } from "nock"
import { communeFixtures, generateFormationInternalFixture, generateUserFixture } from "shared/models/fixtures/index"
import { beforeAll, beforeEach, describe, expect, it } from "vitest"

import { generateApiKey } from "@/actions/users.actions.js"
import type { Server } from "@/server/server.js"
import createServer from "@/server/server.js"
import { getDbCollection } from "@/services/mongodb/mongodbService.js"
import { MCP_RATE_LIMIT } from "./mcp.routes.js"

useMongo()

beforeEach(() => {
  disableNetConnect()

  return () => {
    cleanAll()
    enableNetConnect()
  }
})

let app: Server

beforeAll(async () => {
  app = await createServer()
  await app.ready()

  return () => app.close()
}, 15_000)

const LBA = "https://labonnealternance-recette.apprentissage.beta.gouv.fr"
const LBA_SANDBOX = "https://labonnealternance-sandbox-test.apprentissage.beta.gouv.fr"

const users = {
  alice: generateUserFixture({ email: "alice@exemple.fr", is_admin: false, organisation: null }),
  bob: generateUserFixture({ email: "bob@exemple.fr", is_admin: false, organisation: null }),
}

const tokens = { alice: "", bob: "", aliceSandbox: "" }

beforeEach(async () => {
  await getDbCollection("users").insertMany(Object.values(users))
  ;[tokens.alice, tokens.bob, tokens.aliceSandbox] = (
    await Promise.all([generateApiKey("", "production", users.alice), generateApiKey("", "production", users.bob), generateApiKey("", "sandbox", users.alice)])
  ).map((k) => k.value)
})

type RpcOptions = { token?: string | null; headers?: Record<string, string> }

let rpcId = 0

async function rpc(method: string, params: unknown, { token = tokens.alice, headers = {} }: RpcOptions = {}) {
  rpcId += 1
  return app.inject({
    method: "POST",
    url: "/api/mcp",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      ...(token === null ? {} : { authorization: `Bearer ${token}` }),
      ...headers,
    },
    payload: { jsonrpc: "2.0", id: rpcId, method, params },
  })
}

function rpcResult<T>(response: { body: string }): T {
  return (JSON.parse(response.body) as { result: T }).result
}

async function callTool(name: string, args: Record<string, unknown>, options?: RpcOptions) {
  const response = await rpc("tools/call", { name, arguments: args }, options)
  expect(response.statusCode).toBe(200)
  const result = rpcResult<{ content: { type: string; text: string }[]; isError?: boolean }>(response)
  return { isError: result.isError === true, text: result.content[0].text, raw: response.body }
}

// Offre telle que LBA la renvoie, avec toutes les données qui ne doivent PAS sortir du MCP.
const lbaJob = {
  identifier: { id: "6687165396d52b5e01b409545", partner_label: "offres_emploi_lba", partner_job_id: "interne-42" },
  lba_url: `${LBA}/emploi/offres_emploi_lba/6687165396d52b5e01b409545/developpeur-web`,
  workplace: {
    siret: "11000001500013",
    name: "Boulangerie Dupain",
    brand: null,
    legal_name: "DUPAIN SAS",
    website: null,
    description: null,
    size: null,
    location: { address: "1 rue de la Paix 75002 Paris", geopoint: { type: "Point", coordinates: [2.33, 48.86] } },
    domain: { idcc: null, opco: null, naf: { code: "1071C", label: "Boulangerie" } },
  },
  apply: { url: "https://partenaire.example/postuler?ref=42", phone: "0102030405", recipient_id: "partners_6687165396d52b5e01b409545", email: "recruteur@dupain.example" },
  contract: { start: "2026-09-01T00:00:00.000Z", start_type: "precise_date", start_is_flexible: false, duration: 24, type: ["Apprentissage"], remote: "onsite" },
  offer: {
    title: "Développeur web",
    rome_codes: ["M1805"],
    description: "Contactez Jean Recruteur pour en savoir plus sur le poste.",
    target_diploma: { european: "6", label: "Licence" },
    desired_skills: ["HTML"],
    to_be_acquired_skills: ["TypeScript"],
    access_conditions: [],
    publication: { creation: "2026-11-01T00:00:00.000Z", expiration: "2027-01-01T00:00:00.000Z" },
    opening_count: 1,
    status: "Active",
    to_applicant_questions: null,
  },
  is_delegated: false,
}

const LEAKS = ["0102030405", "recruteur@dupain.example", "partners_6687165396d52b5e01b409545", "partenaire.example", "interne-42", "11000001500013"]

function expectNoLeak(raw: string) {
  for (const leak of LEAKS) {
    expect.soft(raw, `fuite de ${leak}`).not.toContain(leak)
  }
}

describe("authentification", () => {
  it.each([
    ["tools/list", {}],
    ["tools/call", { name: "rechercher_offres", arguments: { romes: ["M1805"] } }],
    ["initialize", { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "test", version: "1" } }],
  ])("refuse %s sans clé d'API", async (method, params) => {
    const response = await rpc(method, params, { token: null })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toEqual({ statusCode: 401, name: "Unauthorized", message: "Vous devez fournir une clé d'API valide pour accéder à cette ressource" })
  })

  it("refuse une clé d'API invalide", async () => {
    const response = await rpc("tools/list", {}, { token: `${tokens.alice}invalid` })

    expect(response.statusCode).toBe(401)
  })

  it("répond 405 sur GET et DELETE", async () => {
    for (const method of ["GET", "DELETE"] as const) {
      const response = await app.inject({ method, url: "/api/mcp", headers: { authorization: `Bearer ${tokens.alice}`, accept: "text/event-stream" } })
      expect.soft(response.statusCode, method).toBe(405)
    }
  })
})

describe("tools/list", () => {
  it("expose exactement les trois outils, tous en lecture seule", async () => {
    const response = await rpc("tools/list", {})

    expect(response.statusCode).toBe(200)
    const { tools } = rpcResult<{ tools: { name: string; annotations?: { readOnlyHint?: boolean } }[] }>(response)
    expect(tools.map((t) => t.name).sort()).toEqual(["detail_offre", "rechercher_formations", "rechercher_offres"])
    expect(tools.every((t) => t.annotations?.readOnlyHint === true)).toBe(true)
  })
})

describe("detail_offre", () => {
  it("renvoie « offre introuvable » quand LBA répond 404 à la lecture multicast", async () => {
    // LBA répond 404 à multicast_only=true pour une offre non diffusable : sans ce paramètre, l'offre serait lisible.
    const scope = nock(`${LBA}/api`).get(`/v3/jobs/${lbaJob.identifier.id}`).query({ multicast_only: "true" }).reply(404, { statusCode: 404, message: "Not Found" })

    const result = await callTool("detail_offre", { id: lbaJob.identifier.id })

    expect(scope.isDone()).toBe(true)
    expect(result.isError).toBe(true)
    expect(result.text).toBe(`Offre introuvable pour l'identifiant ${lbaJob.identifier.id}.`)
  })

  it("n'interroge jamais LBA sans multicast_only", async () => {
    // Seule la requête SANS le paramètre est mockée : si l'outil l'émettait, il obtiendrait l'offre.
    nock(`${LBA}/api`)
      .get(`/v3/jobs/${lbaJob.identifier.id}`)
      .query((q) => !("multicast_only" in q))
      .reply(200, lbaJob)

    const result = await callTool("detail_offre", { id: lbaJob.identifier.id })

    expect(result.isError).toBe(true)
    expect(result.raw).not.toContain("Développeur web")
  })

  it("renvoie le détail avec le lien de fiche et sans donnée de contact", async () => {
    nock(`${LBA}/api`).get(`/v3/jobs/${lbaJob.identifier.id}`).query({ multicast_only: "true" }).reply(200, lbaJob)

    const result = await callTool("detail_offre", { id: lbaJob.identifier.id })

    expect(result.isError).toBe(false)
    expectNoLeak(result.raw)
    expect(JSON.parse(result.text)).toEqual({
      id: lbaJob.identifier.id,
      titre: "Développeur web",
      entreprise: "Boulangerie Dupain",
      lieu: "1 rue de la Paix 75002 Paris",
      types_contrat: ["Apprentissage"],
      niveau_diplome: "Licence",
      date_debut: "2026-09-01T00:00:00.000Z",
      date_publication: "2026-11-01T00:00:00.000Z",
      url_fiche: lbaJob.lba_url,
      description: "Contactez Jean Recruteur pour en savoir plus sur le poste.",
      secteur: "Boulangerie",
      duree_mois: 24,
      teletravail: "onsite",
      codes_rome: ["M1805"],
      competences_attendues: ["HTML"],
      competences_a_acquerir: ["TypeScript"],
      conditions_acces: [],
      nombre_postes: 1,
      date_expiration: "2027-01-01T00:00:00.000Z",
    })
  })

  it("échoue sans résultat partiel quand LBA ne renvoie pas lba_url", async () => {
    const { lba_url: _lbaUrl, ...withoutUrl } = lbaJob
    nock(`${LBA}/api`).get(`/v3/jobs/${lbaJob.identifier.id}`).query({ multicast_only: "true" }).reply(200, withoutUrl)

    const result = await callTool("detail_offre", { id: lbaJob.identifier.id })

    expect(result.isError).toBe(true)
    expect(result.raw).not.toContain("Développeur web")
  })
})

describe("rechercher_offres", () => {
  it("par codes ROME : interroge /v3/jobs/search, ignore les recruteurs et réduit les champs", async () => {
    const scope = nock(`${LBA}/api`)
      .get("/v3/jobs/search")
      .query({ romes: "M1805,M1810", target_diploma_level: "6" })
      .reply(200, { jobs: [lbaJob], recruiters: [{ identifier: { id: "recruteur-1" }, workplace: { name: "Recruteur spontané" }, apply: { phone: "0607080910" } }], warnings: [] })

    const result = await callTool("rechercher_offres", { romes: ["M1805", "M1810"], niveau_diplome: "6" })

    expect(scope.isDone()).toBe(true)
    expect(result.isError).toBe(false)
    expectNoLeak(result.raw)
    expect(result.raw).not.toContain("Recruteur spontané")
    const page = JSON.parse(result.text)
    expect(page).toMatchObject({ page: 0, nombre_pages: 1, total: 1 })
    expect(page.resultats).toEqual([
      {
        id: lbaJob.identifier.id,
        titre: "Développeur web",
        entreprise: "Boulangerie Dupain",
        lieu: "1 rue de la Paix 75002 Paris",
        types_contrat: ["Apprentissage"],
        niveau_diplome: "Licence",
        date_debut: "2026-09-01T00:00:00.000Z",
        date_publication: "2026-11-01T00:00:00.000Z",
        extrait: "Contactez Jean Recruteur pour en savoir plus sur le poste.",
        url_fiche: lbaJob.lba_url,
      },
    ])
  })

  it("pagine localement les résultats de /v3/jobs/search", async () => {
    const jobs = Array.from({ length: 45 }, (_, i) => ({ ...lbaJob, identifier: { id: `job-${i}` } }))
    nock(`${LBA}/api`).get("/v3/jobs/search").query({ romes: "M1805" }).reply(200, { jobs, recruiters: [], warnings: [] })

    const result = await callTool("rechercher_offres", { romes: ["M1805"], page: 2 })

    const page = JSON.parse(result.text)
    expect(page).toMatchObject({ page: 2, nombre_pages: 3, total: 45 })
    expect(page.resultats.map((r: { id: string }) => r.id)).toEqual(["job-40", "job-41", "job-42", "job-43", "job-44"])
  })

  it("en texte libre : interroge /v3/search en mode emplois", async () => {
    const scope = nock(`${LBA}/api`)
      .get("/v3/search")
      .query({ q: "boulanger", mode: "emplois", page: "0", hitsPerPage: "20" })
      .reply(200, {
        hits: [
          {
            _id: "x",
            url_id: "offre-1",
            type: "offre",
            sub_type: "offres_emploi_partenaires",
            lba_url: `${LBA}/emploi/offres_emploi_partenaires/offre-1/boulanger`,
            title: "Boulanger",
            description: "Pétrir",
            address: "Lyon",
            organization_name: "Au bon pain",
            contract_type: ["Apprentissage"],
            level: "3",
            apply_phone: "0102030405",
          },
        ],
        nbHits: 1,
        page: 0,
        nbPages: 1,
      })

    const result = await callTool("rechercher_offres", { q: "boulanger" })

    expect(scope.isDone()).toBe(true)
    expectNoLeak(result.raw)
    expect(JSON.parse(result.text)).toEqual({
      resultats: [
        {
          id: "offre-1",
          titre: "Boulanger",
          entreprise: "Au bon pain",
          lieu: "Lyon",
          types_contrat: ["Apprentissage"],
          niveau_diplome: "3",
          date_debut: null,
          date_publication: null,
          extrait: "Pétrir",
          url_fiche: `${LBA}/emploi/offres_emploi_partenaires/offre-1/boulanger`,
        },
      ],
      page: 0,
      nombre_pages: 1,
      total: 1,
    })
  })

  it("résout code_commune en coordonnées", async () => {
    const commune = communeFixtures[0]
    await getDbCollection("commune").insertOne(commune)
    const [longitude, latitude] = commune.localisation.centre.coordinates
    const scope = nock(`${LBA}/api`)
      .get("/v3/jobs/search")
      .query({ latitude: String(latitude), longitude: String(longitude), radius: "10" })
      .reply(200, { jobs: [], recruiters: [], warnings: [] })

    const result = await callTool("rechercher_offres", { code_commune: commune.code.insee, rayon_km: 10 })

    expect(scope.isDone()).toBe(true)
    expect(result.isError).toBe(false)
  })

  it.each([
    [{ q: "boulanger", romes: ["M1805"] }, "Fournir soit q (texte libre), soit romes (codes ROME), pas les deux."],
    [{}, "Préciser au moins un critère : q, romes, ou un lieu (code_commune ou latitude/longitude)."],
    [{ romes: ["M1805"], latitude: 48.8 }, "latitude et longitude doivent être fournies ensemble."],
    [{ romes: ["M1805"], code_commune: "99999" }, "Aucune commune trouvée pour le code 99999. Fournir un code INSEE ou un code postal valide, ou latitude et longitude."],
  ])("refuse l'entrée %j sans appeler LBA", async (args, message) => {
    const result = await callTool("rechercher_offres", args)

    expect(result.isError).toBe(true)
    expect(result.text).toBe(message)
  })

  it("renvoie une erreur générique quand LBA est en panne, sans détail interne", async () => {
    nock(`${LBA}/api`).get("/v3/jobs/search").query(true).reply(500, { message: "stack interne LBA" })

    const result = await callTool("rechercher_offres", { romes: ["M1805"] })

    expect(result.isError).toBe(true)
    expect(result.text).toBe("Le service est momentanément indisponible. Réessayer plus tard.")
    expect(result.raw).not.toContain("stack interne LBA")
  })

  it("route une clé sandbox vers l'upstream sandbox", async () => {
    const scope = nock(`${LBA_SANDBOX}/api`).get("/v3/jobs/search").query({ romes: "M1805" }).reply(200, { jobs: [], recruiters: [], warnings: [] })

    const result = await callTool("rechercher_offres", { romes: ["M1805"] }, { token: tokens.aliceSandbox })

    expect(scope.isDone()).toBe(true)
    expect(result.isError).toBe(false)
  })
})

describe("rechercher_formations", () => {
  it("par codes ROME : lit le catalogue local, construit le lien de fiche et retire les contacts", async () => {
    const organisme = { contacts: [{ email: "contact-organisme@cfa.example", sources: ["test"], confirmation_referentiel: true }] }
    const formation = generateFormationInternalFixture({
      identifiant: { cle_ministere_educatif: "088281P01313885594860007038855948600070-67118#L01" },
      contact: { email: "contact-formation@cfa.example", telephone: "0299000000" },
      formateur: { organisme, connu: true },
      responsable: { organisme, connu: true },
    })
    await getDbCollection("formation").insertOne(formation)
    const rome = formation.certification.valeur.domaines.rome.rncp?.[0]?.code
    expect(rome, "la fixture doit porter un code ROME").toBeDefined()

    const result = await callTool("rechercher_formations", { romes: [rome] })

    expect(result.isError).toBe(false)
    for (const leak of ["contact-organisme@cfa.example", "contact-formation@cfa.example", "0299000000"]) {
      expect.soft(result.raw, `fuite de ${leak}`).not.toContain(leak)
    }
    const page = JSON.parse(result.text)
    expect(page.resultats).toHaveLength(1)
    expect(page.resultats[0].id).toBe(formation.identifiant.cle_ministere_educatif)
    expect(page.resultats[0].url_fiche).toMatch(new RegExp(`^${LBA}/formation/${encodeURIComponent(formation.identifiant.cle_ministere_educatif)}/[a-z0-9-]+$`))
  })

  it("en texte libre : interroge /v3/search en mode formations", async () => {
    const scope = nock(`${LBA}/api`)
      .get("/v3/search")
      .query({ q: "bts commerce", mode: "formations", page: "0", hitsPerPage: "20" })
      .reply(200, {
        hits: [{ url_id: "cle-1", lba_url: `${LBA}/formation/cle-1/bts-commerce`, title: "BTS Commerce", organization_name: "CFA du Centre", address: "Tours", level: "5" }],
        nbHits: 1,
        page: 0,
        nbPages: 1,
      })

    const result = await callTool("rechercher_formations", { q: "bts commerce" })

    expect(scope.isDone()).toBe(true)
    expect(JSON.parse(result.text).resultats).toEqual([
      { id: "cle-1", titre: "BTS Commerce", organisme: "CFA du Centre", lieu: "Tours", niveau_diplome: "5", extrait: null, url_fiche: `${LBA}/formation/cle-1/bts-commerce` },
    ])
  })
})

describe("traçage", () => {
  it("compte les appels par clé, outil, client et statut", async () => {
    nock(`${LBA}/api`).get("/v3/jobs/search").query(true).times(2).reply(200, { jobs: [], recruiters: [], warnings: [] })

    await callTool("rechercher_offres", { romes: ["M1805"] }, { headers: { "user-agent": "claude-code/2.1.0 (cli)" } })
    await callTool("rechercher_offres", { romes: ["M1805"] }, { headers: { "user-agent": "claude-code/2.1.0 (cli)" } })
    await callTool("rechercher_offres", {}, { headers: { "user-agent": "claude-code/2.1.0 (cli)" } })

    const usage = await getDbCollection("indicateurs.usage_mcp")
      .find({}, { projection: { _id: 0, date: 0, api_key_id: 0 } })
      .sort({ status: 1 })
      .toArray()
    expect(usage).toEqual([
      { user_id: users.alice._id, tool: "rechercher_offres", client: "claude-code", status: "success", count: 2 },
      { user_id: users.alice._id, tool: "rechercher_offres", client: "claude-code", status: "tool_error", count: 1 },
    ])
  })
})

describe("quota", () => {
  it(`limite à ${MCP_RATE_LIMIT.max} requêtes par minute et par clé d'API`, async () => {
    for (let i = 0; i < MCP_RATE_LIMIT.max; i++) {
      const response = await rpc("tools/list", {}, { token: tokens.bob })
      expect(response.statusCode).toBe(200)
    }

    const limited = await rpc("tools/list", {}, { token: tokens.bob })
    expect(limited.statusCode).toBe(429)
    expect(limited.json().message).toContain(`Quota dépassé : ${MCP_RATE_LIMIT.max} requêtes`)

    const other = await rpc("tools/list", {}, { token: tokens.alice })
    expect(other.statusCode).toBe(200)
  })
})

describe("CORS", () => {
  it("admet toute origine sur /api/mcp, sans credentials", async () => {
    const response = await app.inject({
      method: "OPTIONS",
      url: "/api/mcp",
      headers: { origin: "https://inspector.example", "access-control-request-method": "POST", "access-control-request-headers": "authorization,content-type" },
    })

    expect(response.headers["access-control-allow-origin"]).toBe("*")
    expect(response.headers["access-control-allow-credentials"]).toBeUndefined()
  })

  it("ne change pas la politique des autres routes", async () => {
    const response = await app.inject({
      method: "OPTIONS",
      url: "/api/job/v1/search",
      headers: { origin: "https://inspector.example", "access-control-request-method": "GET" },
    })

    expect(response.headers["access-control-allow-origin"]).toBeUndefined()
  })
})
