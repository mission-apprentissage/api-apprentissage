import luhn from "luhn";
import { z } from "zod";

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
export const zUai = z
  .string()
  .regex(/^\d{1,7}[A-Z]$/, "UAI does not match the format /^\\d{1,7}[A-Z]$/")
  .transform((value) => value.padStart(8, "0"))
  .refine(
    (value) => {
      const [uai, checksum] = [value.slice(0, -1), value.slice(-1)];
      const uaiValue = parseInt(uai, 10);

      if (isNaN(uaiValue)) {
        return false;
      }

      const expectedChecksum = ALPHABET_23_LETTERS[uaiValue % 23];

      return checksum === expectedChecksum;
    },
    { message: "UAI checksum is invalid" }
  );

export const zSiret = z
  .string()
  .regex(/^\d{9,14}$/, "SIRET does not match the format /^\\d{14}$/")
  .transform((value) => value.padStart(14, "0"))
  .refine(validateSIRET, { message: "SIRET does not pass the Luhn algorithm" })
  .openapi({ example: "13002526500013" });
