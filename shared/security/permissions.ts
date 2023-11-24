export type Permission = "admin" | "user:manage";

export type RoleNames = "none" | "admin";

export interface Role {
  name: RoleNames;
  permissions: Permission[];
}

export const NoneRole = {
  name: "none",
  permissions: [],
} satisfies Role;

export const AdminRole = {
  name: "admin",
  permissions: ["admin", "user:manage"],
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
