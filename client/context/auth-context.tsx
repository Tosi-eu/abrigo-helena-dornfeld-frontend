import { createContext, useState, useEffect, ReactNode } from "react";
import { AuthContextType, LoggedUser } from "@/interfaces/interfaces";
import { login as apiLogin, logoutRequest } from "@/api/requests";
import {
  initSessionTimeout,
  cleanupSessionTimeout,
  resetInactivityTimer,
} from "@/helpers/session-timeout.helper";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<LoggedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem("user");
    const token = sessionStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      initSessionTimeout(
        () => {
          handleLogout();
        },
        () => {
          console.warn("Sua sessão expirará em breve por inatividade");
        },
      );
    }

    setLoading(false);

    return () => {
      cleanupSessionTimeout();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logoutRequest();
    } catch (err) {
      console.error(err);
    } finally {
      setUser(null);
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      cleanupSessionTimeout();
    }
  };

  const login = async (login: string, password: string) => {
    const data = await apiLogin(login, password);

    const loggedUser = data.user;

    setUser(loggedUser);

    sessionStorage.setItem("user", JSON.stringify(loggedUser));
    sessionStorage.setItem("token", data.token);

    initSessionTimeout(
      () => {
        handleLogout();
      },
      () => {
        console.warn("Sua sessão expirará em breve por inatividade");
      },
    );
  };

  const logout = async () => {
    await handleLogout();
  };

  useEffect(() => {
    if (user) {
      resetInactivityTimer();
    }
  }, [user]);

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
