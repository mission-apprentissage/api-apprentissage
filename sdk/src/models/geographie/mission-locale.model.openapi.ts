import { missionLocaleModelDoc } from "../../docs/models/mission-locale/mission-locale.model.doc.js";
import type { OpenapiModel } from "../../openapi/types.js";
import { zMissionLocale } from "./mission-locale.model.js";

export const missionLocaleModelOpenapi: OpenapiModel<"MissionLocale"> = {
  name: "MissionLocale",
  doc: missionLocaleModelDoc,
  zod: zMissionLocale,
};
