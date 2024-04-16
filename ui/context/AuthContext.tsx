"use client";
import { createContext, FC, PropsWithChildren, useContext, useState } from "react";
import { IUserPublic } from "shared/models/user.model";

interface IAuthContext {
  user: IUserPublic | null;
  setUser: (user: IUserPublic | null) => void;
}

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

export const useAuth = () => useContext(AuthContext);
