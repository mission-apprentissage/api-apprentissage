import { ICertification } from "shared/models/certification.model";

export function buildCertificationPeriodeValidite(
  cfd: ICertification["cfd"],
  rncp: ICertification["rncp"]
): ICertification["periode_validite"] {
  const ouverture = cfd?.ouverture ?? cfd?.creation ?? null;
  const activation = rncp?.activation ?? null;

  let debut: Date | null = ouverture ?? activation;

  if (ouverture != null && activation != null) {
    debut = ouverture > activation ? ouverture : activation;
  }

  const fermeture = cfd?.fermeture ?? null;
  const finEnregistrement = rncp?.fin_enregistrement ?? null;

  let fin: Date | null = fermeture ?? finEnregistrement;
  if (fermeture != null && finEnregistrement != null) {
    fin = fermeture < finEnregistrement ? fermeture : finEnregistrement;
  }

  return {
    debut,
    fin,
  };
}
