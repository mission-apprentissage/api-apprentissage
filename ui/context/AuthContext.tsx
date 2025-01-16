"use client";
import type { FC, PropsWithChildren } from "react";
import { createContext, useContext, useMemo, useState } from "react";
import type { ISessionJson } from "shared/routes/_private/auth.routes";

type IAuthContext = Readonly<{
  session: ISessionJson | null;
  setSession: (session: ISessionJson | null) => void;
}>;

export const AuthContext = createContext<IAuthContext>({
  session: null,
  setSession: () => {},
});

interface Props extends PropsWithChildren {
  initialSession: ISessionJson | null;
}

export const AuthContextProvider: FC<Props> = ({ initialSession, children }) => {
  const [session, setSession] = useState<ISessionJson | null>(initialSession);

  return <AuthContext.Provider value={{ session, setSession }}>{children}</AuthContext.Provider>;
};

export const useAuth = (): Readonly<IAuthContext> => {
  return useContext(AuthContext);
};

export const useAuthRequired = (): Readonly<{
  session: ISessionJson;
  setSession: IAuthContext["setSession"];
}> => {
  const context = useAuth();
  const result = useMemo(() => {
    if (context.session === null) {
      throw new Error("useAuth must be used within an AuthProvider");
    }

    return {
      session: context.session,
      setSession: context.setSession,
    };
  }, [context]);

  return result;
};
