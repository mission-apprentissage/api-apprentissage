"use client";
import type { FC, PropsWithChildren } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { IUserPublic } from "shared/models/user.model";

type IAuthContext = Readonly<{
  user: IUserPublic | null;
  setUser: (user: IUserPublic | null) => void;
}>;

export const AuthContext = createContext<IAuthContext>({
  user: null,
  setUser: () => {},
});

interface Props extends PropsWithChildren {
  initialUser: IUserPublic | null;
}

export const AuthContextProvider: FC<Props> = ({ initialUser, children }) => {
  const [user, setUser] = useState<IUserPublic | null>(initialUser);

  return <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): Readonly<IAuthContext> => {
  return useContext(AuthContext);
};

export const useAuthRequired = (): Readonly<{
  user: IUserPublic;
  setUser: IAuthContext["setUser"];
}> => {
  const context = useAuth();
  const result = useMemo(() => {
    if (context.user === null) {
      throw new Error("useAuth must be used within an AuthProvider");
    }

    return {
      user: context.user,
      setUser: context.setUser,
    };
  }, [context]);

  return result;
};
