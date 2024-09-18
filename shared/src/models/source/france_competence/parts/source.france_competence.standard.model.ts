import { zTypeEnregistrement } from "api-alternance-sdk/internal";
import { z } from "zod";

export const zSourceFcStandard = z
  .object({
    Id_Fiche: z.string(),
    Numero_Fiche: z.string(),
    Intitule: z.string(),
    Abrege_Libelle: z.string().nullable(),
    Abrege_Intitule: z.string().nullable(),
    Nomenclature_Europe_Niveau: z.string().nullable(),
    Nomenclature_Europe_Intitule: z.string().nullable(),
    Accessible_Nouvelle_Caledonie: z.string().nullable(),
    Accessible_Polynesie_Francaise: z.string().nullable(),
    Date_dernier_jo: z.string().nullable(),
    Date_Decision: z.string().nullable(),
    Date_Fin_Enregistrement: z.string().nullable(),
    Date_Effet: z.string().nullable(),
    Type_Enregistrement: zTypeEnregistrement,
    Validation_Partielle: z.string().nullable(),
    Actif: z.enum(["ACTIVE", "INACTIVE"]).nullable(),
  })
  .strict();

export type ISourceFcStandard = z.infer<typeof zSourceFcStandard>;
