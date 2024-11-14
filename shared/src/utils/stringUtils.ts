export const joinNonNullStrings = (values: (string | null | undefined)[]): string | null => {
  const result = values
    .filter((item) => item !== null && item !== undefined && item.trim() !== "")
    .map((item) => item!.trim() + " ")
    .join("")
    .trim();

  return result || null;
};
