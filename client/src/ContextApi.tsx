import type { User } from "./type";
import { createContext, useState, useEffect } from "react";

type AuthContextType = {
  auth: boolean;
  setAuth: React.Dispatch<React.SetStateAction<boolean>>;
  user: User;
  setUser: React.Dispatch<React.SetStateAction<User>>;
  logout: () => void;
};
/* eslint-disable-next-line react-refresh/only-export-components */
export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [auth, setAuth] = useState<boolean>(() => {
    const savedAuth = localStorage.getItem("auth");
    return savedAuth ? JSON.parse(savedAuth) : false;
  });

  const [user, setUser] = useState<User>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : ({} as User);
  });

  useEffect(() => {
    localStorage.setItem("auth", JSON.stringify(auth));
  }, [auth]);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(user));
  }, [user]);

  const logout = () => {
    setAuth(false);
    setUser({} as User);
    localStorage.removeItem("auth");
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
