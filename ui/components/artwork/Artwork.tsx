import Image from "next/image";

type IArtworkData = Record<string, { src: string; alt: string; width: number; height: number }>;

const artworkData = {
  "thinking-woman-2": {
    src: "/asset/artwork/thinking-woman-2.svg",
    alt: "Illustration d'une femme qui a une idée",
    width: 125,
    height: 144,
  },
  solide_II: {
    src: "/asset/artwork/process/solide_II.svg",
    alt: "Illustration d'un développeur qui travaille sur un ordinateur",
    width: 177,
    height: 129,
  },
  designer: {
    src: "/asset/artwork/designer.svg",
    alt: "Illustration d'une designeuse qui présente un projet sur un écran",
    width: 124,
    height: 126,
  },
  man: {
    src: "/asset/artwork/man.svg",
    alt: "Illustration d'un homme qui travaille sur un ordinateur",
    width: 132,
    height: 128,
  },
  "human-cooperation": {
    src: "/asset/artwork/human-cooperation.svg",
    alt: "Illustration de 3 mains posées les unes sur les autres",
    width: 80,
    height: 80,
  },
  book: {
    src: "/asset/artwork/book.svg",
    alt: "Illustration d'un livre ouvert",
    width: 80,
    height: 80,
  },
  school: {
    src: "/asset/artwork/school.svg",
    alt: "Illustration d'un établissement scolaire",
    width: 80,
    height: 80,
  },
  "not-found-solid-iii-0": {
    src: "/asset/artwork/not-found-solid-iii-0.svg",
    alt: "Illustration d'un homme qui hausse les épaules",
    width: 304,
    height: 143,
  },
  outline_III: {
    src: "/asset/artwork/product_launch/outline_III.svg",
    alt: "Illustration d'une personne qui fait décoller une fusée",
    width: 240,
    height: 108,
  },
  "mail-sent": {
    src: "/asset/artwork/mail-sent.svg",
    alt: "Illustration d'une enveloppe avec un mail envoyé",
    width: 278,
    height: 156,
  },
  "data-security": {
    src: "/asset/artwork/data-security.svg",
    alt: "Illustration d'une page web avec des graphiques et sécurisée avec un cadenas",
    width: 393,
    height: 208,
  },
  avatar: {
    src: "/asset/artwork/avatar.svg",
    alt: "Illustration du profil d'une personne",
    width: 40,
    height: 40,
  },
  money: {
    src: "/asset/artwork/theme-clair-money.svg",
    alt: "Illustration d'une pile de pièces de monnaie",
    width: 80,
    height: 80,
  },
} as const satisfies IArtworkData;

type ArtworkName = keyof typeof artworkData;

export function Artwork({ name }: { name: ArtworkName }) {
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image {...artworkData[name]} />;
}
