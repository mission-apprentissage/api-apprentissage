import { zTypeEnregistrement } from "api-alternance-sdk/internal";
import { z } from "zod/v4-mini";

export const zSourceFcStandard = z.object({
  Id_Fiche: z.string(),
  Numero_Fiche: z.string(),
  Intitule: z.string(),
  Abrege_Libelle: z.nullable(z.string()),
  Abrege_Intitule: z.nullable(z.string()),
  Nomenclature_Europe_Niveau: z.nullable(z.string()),
  Nomenclature_Europe_Intitule: z.nullable(z.string()),
  Accessible_Nouvelle_Caledonie: z.nullable(z.string()),
  Accessible_Polynesie_Francaise: z.nullable(z.string()),
  Date_dernier_jo: z.nullable(z.string()),
  Date_Decision: z.nullable(z.string()),
  Date_Fin_Enregistrement: z.nullable(z.string()),
  Date_Effet: z.nullable(z.string()),
  Type_Enregistrement: zTypeEnregistrement,
  Validation_Partielle: z.nullable(z.string()),
  Actif: z.nullable(z.enum(["ACTIVE", "INACTIVE"])),
});

export type ISourceFcStandard = z.infer<typeof zSourceFcStandard>;
