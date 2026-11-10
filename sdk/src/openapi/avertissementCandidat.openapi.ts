// Avertissement aux candidats qui créent un compte développeur en pensant pouvoir postuler (lba#5533, lba#5772).
// Découpé en fragments pour être rendu en React (portail) comme en Markdown (doc technique)
export const avertissementCandidatOpenapi = {
  accroche: { fr: "Vous cherchez une alternance ?", en: "Looking for an apprenticeship?" },
  texte: {
    fr: "L’envoi de candidatures via l’API est réservé aux plateformes partenaires. Un compte développeur ne vous permettra pas de postuler aux offres. Pour postuler, rendez-vous directement sur",
    en: "Sending applications through the API is reserved for partner platforms. A developer account will not let you apply to job offers. To apply, go directly to",
  },
  lien: {
    label: { fr: "La bonne alternance", en: "La bonne alternance" },
    // Intitulé du lien ouvert dans un nouvel onglet (RGAA 13.2)
    title: { fr: "La bonne alternance - nouvelle fenêtre", en: "La bonne alternance - new window" },
    href: "https://labonnealternance.apprentissage.beta.gouv.fr/",
  },
} as const
