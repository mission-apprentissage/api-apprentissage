import luhn from "luhn";
import { z } from "zod/v4-mini";

export const validateSIRET = (siret: string): boolean => {
  if (!siret) {
    return false;
  }
  if (siret.length !== 14) {
    return false;
  }
  const isLuhnValid = luhn.validate(siret);
  // cas La poste
  if (!isLuhnValid && siret.startsWith("356000000")) {
    return validationLaPoste(siret);
  }
  return isLuhnValid;
};

const getDigits = (input: string) => {
  if (!input) {
    return [];
  }
  return input.split("").flatMap((char) => (new RegExp("[0-9]").test(char) ? [parseInt(char)] : []));
};

const validationLaPoste = (input: string) => {
  const digits = getDigits(input);
  return digits.reduce((acc, digit) => acc + digit, 0) % 5 === 0;
};
const ALPHABET_23_LETTERS = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  "M",
  "N",
  "P",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

// https://blog.juliendelmas.fr/?qu-est-ce-que-le-code-rne-ou-uai
export const zUai = z.pipe(
  z
    .pipe(
      z.string().check(z.toUpperCase(), z.regex(/^\d{1,7}[A-Z]$/, "UAI does not match the format /^\\d{1,7}[A-Z]$/")),
      z.transform((value) => value.padStart(8, "0"))
    )
    .check(
      z.refine((value) => {
        const [uai, checksum] = [value.slice(0, -1), value.slice(-1)];
        const uaiValue = parseInt(uai, 10);

        if (isNaN(uaiValue)) {
          return false;
        }

        const expectedChecksum = ALPHABET_23_LETTERS[uaiValue % 23];

        return checksum === expectedChecksum;
      }, "UAI checksum is invalid")
    ),
  // Defines the `output` type of the zod (helps with type inference and schema generation)
  z.string().check(z.regex(/^\d{7}[A-Z]$/, "UAI does not match the format /^\\d{7}[A-Z]$/"))
);

export const zSiret = z.pipe(
  z
    .pipe(
      z.string().check(z.regex(/^\d{9,14}$/, "SIRET does not match the format /^\\d{14}$/")),
      z.transform((value) => value.padStart(14, "0"))
    )
    .check(z.refine(validateSIRET, "SIRET does not pass the Luhn algorithm")),
  // Defines the `output` type of the zod (helps with type inference and schema generation)
  z.string().check(z.regex(/^\d{14}$/, "SIRET does not match the format /^\\d{14}$/"))
);
