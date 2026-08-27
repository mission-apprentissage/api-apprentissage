import type { IOrganisation } from "../../models/index.js"
import { ORGANISATION_HABILITATIONS } from "../../models/system/organisation.model.js"

export type Permission = "admin" | "user:manage" | "jobs:write" | "appointments:write" | "applications:write"

export type RoleNames = "none" | "org" | "admin" | "sandbox"

export interface Role {
  name: RoleNames
  permissions: Permission[]
}

export const NoneRole = {
  name: "none",
  permissions: [],
} satisfies Role

export function getBaseRole(organisation: IOrganisation | null): Role {
  return organisation === null
    ? NoneRole
    : {
        name: "org",
        permissions: organisation.habilitations,
      }
}

export const AdminRole = {
  name: "admin",
  permissions: ["admin", "user:manage", "jobs:write"],
} satisfies Role

// Rôle porté par une clé API sandbox : les habilitations métier (écriture forwardée vers LBA
// recette) sont accordées d'office — self-service — jamais admin ni user:manage. Le rôle REMPLACE
// le rôle organisation : révoquer les habilitations d'une organisation ne bloque pas ses clés
// sandbox (remédiation : suppression des clés). Les routes de lecture (access: null) ne passent
// pas par les rôles et servent les mêmes données quelle que soit la clé.
export const SandboxRole = {
  name: "sandbox",
  permissions: [...ORGANISATION_HABILITATIONS],
} satisfies Role

export type AccessPermission = Permission

export type AccessResourcePath = {
  type: "params" | "query"
  key: string
}

export type AccessRessouces = {
  user?: ReadonlyArray<{
    _id: AccessResourcePath
  }>
}

export type UserWithType<T, V> = Readonly<{
  type: T
  value: V
}>
