import { internal } from "@hapi/boom"

// travail-emploi.gouv.fr et dares.travail-emploi.gouv.fr sont derrière un anti-bot F5 qui répond en
// HTTP 200 avec une page de challenge à la place de la page demandée (labonnealternance#5723). Toutes
// ses variantes affichent un identifiant de support, à transmettre aux exploitants du site pour
// qu'ils retrouvent la requête.
const ANTI_BOT_SUPPORT_ID_REGEX = /(?:Your support ID is|Identifiant de support)\s*:\s*(\d+)/i

// Vérifié seulement en l'absence de lien : une page qui contient le lien est exploitable, quoi
// qu'elle contienne d'autre.
export function assertNotBlockedByDaresAntiBot(scope: string, html: string, linkCount: number): void {
  const supportId = linkCount === 0 ? (ANTI_BOT_SUPPORT_ID_REGEX.exec(html)?.[1] ?? null) : null

  if (supportId !== null) {
    throw internal(`${scope}: blocked by anti-bot protection`, { supportId })
  }
}
