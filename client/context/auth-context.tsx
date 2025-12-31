import { createContext, useState, useEffect, ReactNode } from "react";
import { AuthContextType, LoggedUser } from "@/interfaces/interfaces";
import { login as apiLogin, logoutRequest } from "@/api/requests";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  const login = async (login: string, password: string) => {
    const data = await apiLogin(login, password);

    const loggedUser = data.user;

    setUser(loggedUser);

    localStorage.setItem("user", JSON.stringify(loggedUser));
    localStorage.setItem("token", data.token);
  };

  const logout = async () => {
    try {
      await logoutRequest();
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } catch(err) {
      console.error(err);
    }
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
