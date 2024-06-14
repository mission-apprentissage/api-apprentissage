import { z } from "zod";

import { certificationsModelDescriptor } from "./certification.model";
import { IModelDescriptorGeneric } from "./common";
import emailDeniedModelDescriptor from "./email_denied.model";
import emailEventsModelDescriptor from "./email_event.model";
import { importMetaModelDescriptor } from "./import.meta.model";
import { indicateurUsageApiModelDescriptor } from "./indicateurs/usage_api.model";
import sessionsModelDescriptor from "./session.model";
import sourceAcceModelDescriptor from "./source/acce/source.acce.model";
import { sourceBcnModelDescriptor } from "./source/bcn/source.bcn.model";
import sourceCatalogueModelDescriptor from "./source/catalogue/source.catalogue.model";
import { sourceFranceCompetenceModelDescriptor } from "./source/france_competence/source.france_competence.model";
import { sourceKaliCcnModelDescriptor } from "./source/kali/source.kali.ccn.model";
import { sourceKitApprentissageModelDescriptor } from "./source/kitApprentissage/source.kit_apprentissage.model";
import { sourceNpecModelDescriptor } from "./source/npec/source.npec.model";
import { sourceNpecNormalizedModelDescriptor } from "./source/npec/source.npec.normalized.model";
import sourcReferentielModelDescriptor from "./source/referentiel/source.referentiel.model";
import usersModelDescriptor from "./user.model";

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
};

export type IModelDescriptorMap = typeof modelDescriptorMap;

export type IModelDescriptor = IModelDescriptorMap[keyof IModelDescriptorMap];

export const modelDescriptors = Object.values(
  modelDescriptorMap
) as IModelDescriptorMap[keyof IModelDescriptorMap][] satisfies IModelDescriptorGeneric[];

export type CollectionName = keyof typeof modelDescriptorMap;

export type IDocument<Name extends CollectionName> = z.output<(typeof modelDescriptorMap)[Name]["zod"]>;
