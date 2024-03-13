import { zodOpenApi } from "./zodWithOpenApi";

export const zCfdNiveau = zodOpenApi.string().regex(/^[A-Z0-9]{3}$/);
export const zCfd = zodOpenApi.string().regex(/^[A-Z0-9]{3}\d{3}[A-Z0-9]{2}$/);

export const zRncp = zodOpenApi.string().regex(/^RNCP\d{3,5}$/);

export const zNiveauDiplomeEuropeen = zodOpenApi.enum(["1", "2", "3", "4", "5", "6", "7", "8"]);

export type INiveauDiplomeEuropeen = zodOpenApi.output<typeof zNiveauDiplomeEuropeen>;

export const zNsfCode = zodOpenApi.string().regex(/^\d{2,3}[a-z]?$/);

export const zCfdNatureCode = zodOpenApi.string().regex(/^[0-9A-Z]$/);

export const zRncpBlocCompetenceCode = zodOpenApi.string().regex(/^RNCP\d{3,5}BC\d{1,2}$/);

export const zTypeEnregistrement = zodOpenApi.enum(["Enregistrement de droit", "Enregistrement sur demande"]);
