import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useApolloClient, useQuery } from "@apollo/client/react";
import { ME_QUERY } from "../graphql/queries";
import type { User } from "../types";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("financy_token"),
  );
  const [user, setUser] = useState<User | null>(null);
  const client = useApolloClient();

  const {
    loading,
    data: meData,
    error: meError,
  } = useQuery<{ me: User }>(ME_QUERY, {
    skip: !token,
  });

  useEffect(() => {
    if (meData?.me) {
      setUser(meData.me);
    }
  }, [meData]);

  useEffect(() => {
    if (meError) {
      setToken(null);
      setUser(null);
      localStorage.removeItem("financy_token");
    }
  }, [meError]);

  useEffect(() => {
    if (!token) {
      setUser(null);
    }
  }, [token]);

  function login(newToken: string, newUser: User) {
    localStorage.setItem("financy_token", newToken);
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem("financy_token");
    setToken(null);
    setUser(null);
    client.clearStore();
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading: loading && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
