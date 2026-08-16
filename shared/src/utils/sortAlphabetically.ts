// `Intl.Collator` compare des chaînes, mais la fonction est aussi utilisée sur des clefs
// numériques (cf. tests) : le type reflète les deux, et la conversion, jusqu'ici implicite,
// est rendue explicite. Attention, le tri reste lexicographique — [9, 10] sort [10, 9].
export function sortAlphabeticallyBy<Key extends string, T extends { [key in Key]: string | number }>(sortBy: Key, array: readonly T[]): T[] {
  return array.toSorted((a, b) => Intl.Collator().compare(String(a[sortBy]), String(b[sortBy]))) // permet de gérer les accents
}
