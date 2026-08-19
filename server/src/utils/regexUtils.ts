/**
 * Échappe les caractères spéciaux d'une saisie utilisateur avant de l'utiliser dans une expression régulière.
 */
export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
