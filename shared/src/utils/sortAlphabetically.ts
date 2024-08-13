// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function sortAlphabeticallyBy<Key extends string, T extends { [key in Key]: any }>(
  sortBy: Key,
  array: readonly T[]
): T[] {
  return array.toSorted((a, b) => Intl.Collator().compare(a[sortBy], b[sortBy])); // permet de gérer les accents
}
