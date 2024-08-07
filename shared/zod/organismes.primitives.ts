import { validateSIRET } from "../helpers/zodHelpers/siretValidator";
import { zodOpenApi } from "./zodWithOpenApi";
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
export const zUai = zodOpenApi
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

export const zSiret = zodOpenApi
  .string()
  .regex(/^\d{9,14}$/, "SIRET does not match the format /^\\d{14}$/")
  .transform((value) => value.padStart(14, "0"))
  .refine(validateSIRET, { message: "SIRET does not pass the Luhn algorithm" });
