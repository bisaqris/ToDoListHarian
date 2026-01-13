import { createContext, useContext, useState } from "react";
import { mockFirebase } from "../utils/mockFirebase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(mockFirebase.user);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  const login = (email) => {
    setUser({ email, displayName: email.split("@")[0], uid: "123" });
    setIsAuthenticated(true);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
