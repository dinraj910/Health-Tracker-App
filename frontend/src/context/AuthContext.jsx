import { createContext, useState, useEffect } from "react";
import { logoutUser, getCurrentUser } from "../services/authService";

const AuthContext = createContext();

export { AuthContext };

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [token, setToken] = useState(localStorage.getItem("token") || null);
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
      } catch (error) {
        // Token invalid or expired - clear local storage
        setUser(null);
        setToken(null);
        localStorage.clear();
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (data) => {
    setUser(data.user);
    setToken(data.token);

    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      // Ignore logout errors
    }
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
