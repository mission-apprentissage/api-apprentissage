import type { IFormation } from "api-alternance-sdk"
import { kebabCase } from "lodash-es"
import * as z from "zod/v4"

// Les schémas ci-dessous sont des listes blanches : tout champ LBA absent d'un schéma (coordonnées
// du recruteur, identifiant de destinataire, lien de candidature externe…) est écarté au parsing.
// `lba_url` est obligatoire : une réponse LBA sans lien de fiche est une erreur, pas un résultat dégradé.

const zLbaJobOffer = z.object({
  identifier: z.object({ id: z.string() }),
  lba_url: z.url(),
  workplace: z.object({
    name: z.string().nullish(),
    brand: z.string().nullish(),
    legal_name: z.string().nullish(),
    location: z.object({ address: z.string().nullish() }).nullish(),
    domain: z.object({ naf: z.object({ label: z.string().nullish() }).nullish() }).nullish(),
  }),
  contract: z.object({
    start: z.string().nullish(),
    duration: z.number().nullish(),
    type: z.array(z.string()).nullish(),
    remote: z.string().nullish(),
  }),
  offer: z.object({
    title: z.string(),
    description: z.string().nullish(),
    rome_codes: z.array(z.string()).nullish(),
    target_diploma: z.object({ european: z.string().nullish(), label: z.string().nullish() }).nullish(),
    desired_skills: z.array(z.string()).nullish(),
    to_be_acquired_skills: z.array(z.string()).nullish(),
    access_conditions: z.array(z.string()).nullish(),
    opening_count: z.number().nullish(),
    publication: z.object({ creation: z.string().nullish(), expiration: z.string().nullish() }).nullish(),
  }),
})

export const zLbaJobSearchResponse = z.object({ jobs: z.array(zLbaJobOffer) })
export const zLbaJobDetailResponse = zLbaJobOffer

const zLbaSearchHit = z.object({
  url_id: z.string(),
  lba_url: z.url(),
  title: z.string(),
  description: z.string().nullish(),
  address: z.string().nullish(),
  organization_name: z.string().nullish(),
  contract_type: z.array(z.string()).nullish(),
  level: z.string().nullish(),
  activity_sector: z.string().nullish(),
  start_date: z.string().nullish(),
  publication_date: z.string().nullish(),
  distance: z.number().nullish(),
})

export const zLbaTextSearchResponse = z.object({
  hits: z.array(zLbaSearchHit),
  nbHits: z.number(),
  page: z.number(),
  nbPages: z.number(),
})

type ILbaJobOffer = z.output<typeof zLbaJobOffer>
type ILbaSearchHit = z.output<typeof zLbaSearchHit>

const EXCERPT_MAX_LENGTH = 500

function excerpt(text: string | null | undefined): string | null {
  if (!text) return null
  return text.length > EXCERPT_MAX_LENGTH ? `${text.slice(0, EXCERPT_MAX_LENGTH)}…` : text
}

export type IMcpOffreResume = {
  id: string
  titre: string
  entreprise: string | null
  lieu: string | null
  types_contrat: string[]
  niveau_diplome: string | null
  date_debut: string | null
  date_publication: string | null
  extrait: string | null
  url_fiche: string
}

export type IMcpOffreDetail = Omit<IMcpOffreResume, "extrait"> & {
  description: string | null
  secteur: string | null
  duree_mois: number | null
  teletravail: string | null
  codes_rome: string[]
  competences_attendues: string[]
  competences_a_acquerir: string[]
  conditions_acces: string[]
  nombre_postes: number | null
  date_expiration: string | null
}

export type IMcpFormation = {
  id: string
  titre: string
  organisme: string | null
  lieu: string | null
  niveau_diplome: string | null
  extrait: string | null
  url_fiche: string
}

function jobOfferBase(job: ILbaJobOffer): Omit<IMcpOffreResume, "extrait"> {
  return {
    id: job.identifier.id,
    titre: job.offer.title,
    entreprise: job.workplace.name ?? job.workplace.brand ?? job.workplace.legal_name ?? null,
    lieu: job.workplace.location?.address ?? null,
    types_contrat: job.contract.type ?? [],
    niveau_diplome: job.offer.target_diploma?.label ?? job.offer.target_diploma?.european ?? null,
    date_debut: job.contract.start ?? null,
    date_publication: job.offer.publication?.creation ?? null,
    url_fiche: job.lba_url,
  }
}

export function jobOfferToResume(job: ILbaJobOffer): IMcpOffreResume {
  return { ...jobOfferBase(job), extrait: excerpt(job.offer.description) }
}

export function jobOfferToDetail(job: ILbaJobOffer): IMcpOffreDetail {
  return {
    ...jobOfferBase(job),
    description: job.offer.description ?? null,
    secteur: job.workplace.domain?.naf?.label ?? null,
    duree_mois: job.contract.duration ?? null,
    teletravail: job.contract.remote ?? null,
    codes_rome: job.offer.rome_codes ?? [],
    competences_attendues: job.offer.desired_skills ?? [],
    competences_a_acquerir: job.offer.to_be_acquired_skills ?? [],
    conditions_acces: job.offer.access_conditions ?? [],
    nombre_postes: job.offer.opening_count ?? null,
    date_expiration: job.offer.publication?.expiration ?? null,
  }
}

export function searchHitToOffreResume(hit: ILbaSearchHit): IMcpOffreResume {
  return {
    id: hit.url_id,
    titre: hit.title,
    entreprise: hit.organization_name ?? null,
    lieu: hit.address ?? null,
    types_contrat: hit.contract_type ?? [],
    niveau_diplome: hit.level ?? null,
    date_debut: hit.start_date ?? null,
    date_publication: hit.publication_date ?? null,
    extrait: excerpt(hit.description),
    url_fiche: hit.lba_url,
  }
}

export function searchHitToFormation(hit: ILbaSearchHit): IMcpFormation {
  return {
    id: hit.url_id,
    titre: hit.title,
    organisme: hit.organization_name ?? null,
    lieu: hit.address ?? null,
    niveau_diplome: hit.level ?? null,
    extrait: excerpt(hit.description),
    url_fiche: hit.lba_url,
  }
}

function formationTitre(formation: IFormation): string {
  const { cfd, rncp } = formation.certification.valeur.intitule
  return cfd?.long ?? rncp ?? formation.onisep.intitule ?? "Formation en alternance"
}

// Même forme que buildTrainingUrl côté La bonne alternance : `/formation/<clé ME>/<titre en kebab-case>`.
export function buildFormationUrl(lbaSiteUrl: string, formation: IFormation): string {
  const slug = kebabCase(formationTitre(formation)) || "formation"
  return `${lbaSiteUrl}/formation/${encodeURIComponent(formation.identifiant.cle_ministere_educatif)}/${slug}`
}

export function formationToMcp(formation: IFormation, lbaSiteUrl: string): IMcpFormation {
  const organisme = formation.formateur.organisme ?? formation.responsable.organisme
  const niveau = formation.certification.valeur.intitule.niveau
  const { adresse } = formation.lieu

  return {
    id: formation.identifiant.cle_ministere_educatif,
    titre: formationTitre(formation),
    organisme: organisme ? (organisme.etablissement.enseigne ?? organisme.unite_legale.raison_sociale) : null,
    lieu: adresse.label ?? [adresse.code_postal, adresse.commune.nom].filter(Boolean).join(" "),
    niveau_diplome: niveau.rncp?.europeen ?? niveau.cfd?.europeen ?? null,
    extrait: excerpt(formation.contenu_educatif.objectif || formation.contenu_educatif.contenu),
    url_fiche: buildFormationUrl(lbaSiteUrl, formation),
  }
}
