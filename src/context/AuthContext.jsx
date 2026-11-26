import { createContext, useCallback, useEffect, useState } from "react";
import { TOKEN_KEY } from "../services/api.js";
import * as authService from "../services/authService.js";

export const AuthContext = createContext(null);

const USER_KEY = "user";

function loadUser() {
  try {
    return localStorage.getItem(TOKEN_KEY) ? JSON.parse(localStorage.getItem(USER_KEY)) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const save = ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  };

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // Drop a stored session if the token has expired or been rejected.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    authService.me().catch((err) => {
      if (err?.response?.status === 401) logout();
    });
  }, [logout]);

  const value = {
    user,
    login: async (email, password) => save(await authService.login(email, password)),
    register: async (name, email, password) => save(await authService.register(name, email, password)),
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
