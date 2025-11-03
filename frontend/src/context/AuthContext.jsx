import React, { createContext, useContext, useState, useEffect } from "react";

// 1. Create the context
const AuthContext = createContext();

// 2. Create the "Provider" component
export const AuthProvider = ({ children }) => {
  // 3. The state that holds the user info
  const [userInfo, setUserInfo] = useState(null);

  // 4. Check localStorage when the app first loads
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  // 5. Login function
  const login = (userData) => {
    // Save to localStorage
    localStorage.setItem("userInfo", JSON.stringify(userData));
    // Save to state
    setUserInfo(userData);
  };

  // 6. Logout function
  const logout = () => {
    // Remove from localStorage
    localStorage.removeItem("userInfo");
    // Remove from state
    setUserInfo(null);
  };

  // 7. Pass the values to all children components
  return (
    <AuthContext.Provider value={{ userInfo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 8. Create a simple "hook" to use the context
export const useAuth = () => {
  return useContext(AuthContext);
};
