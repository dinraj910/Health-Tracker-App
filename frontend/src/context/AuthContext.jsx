import { createContext, useState, useEffect } from "react";
import { logoutUser, getCurrentUser } from "../services/authService";

const AuthContext = createContext();

export { AuthContext };


export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      return stored && stored !== "undefined" ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("token");
    return t && t !== "undefined" ? t : null;
  });
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // If we have a token stored, verify it's still valid
        if (token) {
          const data = await getCurrentUser();
          setUser(data.user);
        }
      } catch {
        // Token invalid or expired - clear local storage
        setUser(null);
        setToken(null);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [token]);

  const login = (data) => {
    setUser(data.user);
    setToken(data.token);

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore logout errors
    }
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      updateUser,
      loading,
      isAuthenticated: !!user && !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
}
