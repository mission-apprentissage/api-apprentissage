import { z } from "zod";

import { certificationsModelDescriptor } from "./certification.model.js";
import { IModelDescriptorGeneric } from "./common.js";
import emailDeniedModelDescriptor from "./email_denied.model.js";
import emailEventsModelDescriptor from "./email_event.model.js";
import { importMetaModelDescriptor } from "./import.meta.model.js";
import { indicateurUsageApiModelDescriptor } from "./indicateurs/usage_api.model.js";
import sessionsModelDescriptor from "./session.model.js";
import sourceAcceModelDescriptor from "./source/acce/source.acce.model.js";
import { sourceBcnModelDescriptor } from "./source/bcn/source.bcn.model.js";
import sourceCatalogueModelDescriptor from "./source/catalogue/source.catalogue.model.js";
import { sourceDaresApeIdccModelDescriptor } from "./source/dares/source.dares.ape_idcc.model.js";
import { sourceDaresCcnModelDescriptor } from "./source/dares/source.dares.ccn.model.js";
import { sourceFranceCompetenceModelDescriptor } from "./source/france_competence/source.france_competence.model.js";
import { sourceKaliCcnModelDescriptor } from "./source/kali/source.kali.ccn.model.js";
import { sourceKitApprentissageModelDescriptor } from "./source/kitApprentissage/source.kit_apprentissage.model.js";
import { sourceNpecModelDescriptor } from "./source/npec/source.npec.model.js";
import { sourceNpecNormalizedModelDescriptor } from "./source/npec/source.npec.normalized.model.js";
import sourcReferentielModelDescriptor from "./source/referentiel/source.referentiel.model.js";
import usersModelDescriptor from "./user.model.js";

export const modelDescriptorMap = {
  [certificationsModelDescriptor.collectionName]: certificationsModelDescriptor,
  [emailDeniedModelDescriptor.collectionName]: emailDeniedModelDescriptor,
  [emailEventsModelDescriptor.collectionName]: emailEventsModelDescriptor,
  [importMetaModelDescriptor.collectionName]: importMetaModelDescriptor,
  [usersModelDescriptor.collectionName]: usersModelDescriptor,
  [sessionsModelDescriptor.collectionName]: sessionsModelDescriptor,
  [indicateurUsageApiModelDescriptor.collectionName]: indicateurUsageApiModelDescriptor,
  [sourceAcceModelDescriptor.collectionName]: sourceAcceModelDescriptor,
  [sourcReferentielModelDescriptor.collectionName]: sourcReferentielModelDescriptor,
  [sourceBcnModelDescriptor.collectionName]: sourceBcnModelDescriptor,
  [sourceKitApprentissageModelDescriptor.collectionName]: sourceKitApprentissageModelDescriptor,
  [sourceCatalogueModelDescriptor.collectionName]: sourceCatalogueModelDescriptor,
  [sourceFranceCompetenceModelDescriptor.collectionName]: sourceFranceCompetenceModelDescriptor,
  [sourceNpecModelDescriptor.collectionName]: sourceNpecModelDescriptor,
  [sourceNpecNormalizedModelDescriptor.collectionName]: sourceNpecNormalizedModelDescriptor,
  [sourceKaliCcnModelDescriptor.collectionName]: sourceKaliCcnModelDescriptor,
  [sourceDaresCcnModelDescriptor.collectionName]: sourceDaresCcnModelDescriptor,
  [sourceDaresApeIdccModelDescriptor.collectionName]: sourceDaresApeIdccModelDescriptor,
};

export type IModelDescriptorMap = typeof modelDescriptorMap;

export type IModelDescriptor = IModelDescriptorMap[keyof IModelDescriptorMap];

export const modelDescriptors = Object.values(
  modelDescriptorMap
) as IModelDescriptorMap[keyof IModelDescriptorMap][] satisfies IModelDescriptorGeneric[];

export type CollectionName = keyof typeof modelDescriptorMap;

export type IDocument<Name extends CollectionName> = z.output<(typeof modelDescriptorMap)[Name]["zod"]>;
