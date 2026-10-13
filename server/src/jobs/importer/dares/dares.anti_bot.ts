// Les sites de la DARES sont derrière un anti-bot F5 qui répond en HTTP 200 avec une page de
// challenge à la place de la page demandée (labonnealternance#5723). Toutes ses variantes affichent
// un identifiant de support, à transmettre aux exploitants du site pour qu'ils retrouvent la requête.
const ANTI_BOT_SUPPORT_ID_REGEX = /(?:Your support ID is|Identifiant de support)\s*:\s*(\d+)/i

export function getDaresAntiBotSupportId(html: string): string | null {
  return ANTI_BOT_SUPPORT_ID_REGEX.exec(html)?.[1] ?? null
}
