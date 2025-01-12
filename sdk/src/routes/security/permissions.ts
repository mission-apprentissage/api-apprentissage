import type { IOrganisation } from "../../models/index.js";

export type Permission = "admin" | "user:manage" | "jobs:write" | "appointments:write" | "applications:write";

export type RoleNames = "none" | "org" | "admin";

export interface Role {
  name: RoleNames;
  permissions: Permission[];
}

export const NoneRole = {
  name: "none",
  permissions: [],
} satisfies Role;

export function getBaseRole(organisation: IOrganisation | null): Role {
  return organisation === null
    ? NoneRole
    : {
        name: "org",
        permissions: organisation.habilitations,
      };
}

export const AdminRole = {
  name: "admin",
  permissions: ["admin", "user:manage", "jobs:write"],
} satisfies Role;

export type AccessPermission = Permission;

export type AccessResourcePath = {
  type: "params" | "query";
  key: string;
};

export type AccessRessouces = {
  user?: ReadonlyArray<{
    _id: AccessResourcePath;
  }>;
};

export type UserWithType<T, V> = Readonly<{
  type: T;
  value: V;
}>;
